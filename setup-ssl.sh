#!/bin/bash

echo "=== Green Link Logistics SSL Setup ==="
echo ""
echo "This script will install SSL certificates using Let's Encrypt"
echo ""

# Ask for email
read -p "Enter your email address for Let's Encrypt: " email

if [ -z "$email" ]; then
    echo "Error: Email is required"
    exit 1
fi

# Check DNS propagation
echo ""
echo "Checking DNS propagation..."
if nslookup greenlink.website 2>/dev/null | grep -q "44.204.109.54"; then
    echo "✓ DNS is properly pointing to 44.204.109.54"
else
    echo "⚠ DNS might not be propagated yet. This is required for SSL."
    read -p "Continue anyway? (y/n): " cont
    if [ "$cont" != "y" ]; then
        exit 1
    fi
fi

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Stop nginx temporarily to allow certbot to use port 80
echo ""
echo "Stopping nginx temporarily..."
cd ~/green-link-logistics
sudo docker-compose stop nginx

sleep 2

# Get SSL certificate
echo "Obtaining SSL certificate..."
sudo certbot certonly --standalone -d greenlink.website -d www.greenlink.website \
  --non-interactive --agree-tos --email "$email" --expand

# Check if certificate was obtained
if [ -f /etc/letsencrypt/live/greenlink.website/fullchain.pem ]; then
    echo "✓ SSL certificate obtained successfully!"
    
    # Start nginx again
    echo "Starting nginx..."
    sudo docker-compose up -d nginx
    
    sleep 3
    
    # Set up auto-renewal with cron
    echo "Setting up SSL auto-renewal..."
    renewal_cron="0 3 * * * cd ~/green-link-logistics && /usr/bin/docker-compose restart nginx"
    (crontab -l 2>/dev/null | grep -v "docker-compose restart nginx"; echo "$renewal_cron") | crontab -
    
    echo ""
    echo "✓ SSL setup complete!"
    echo ""
    echo "Your site is now accessible at:"
    echo "  - https://greenlink.website"
    echo "  - https://www.greenlink.website"
    echo ""
    echo "HTTP traffic will be redirected to HTTPS"
else
    echo "✗ Failed to obtain SSL certificate"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check DNS: nslookup greenlink.website"
    echo "  2. Check port 80: sudo netstat -tlnp | grep :80"
    echo "  3. Check nginx logs: sudo docker-compose logs nginx"
    echo "  4. Check certbot logs: sudo cat /var/log/letsencrypt/letsencrypt.log"
    echo ""
    
    # Restart nginx anyway
    echo "Restarting nginx..."
    sudo docker-compose up -d nginx
fi
