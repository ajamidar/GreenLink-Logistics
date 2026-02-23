output "ec2_public_ip" {
  value = aws_eip.app.public_ip
}

output "ec2_ssh_command" {
  value = "ssh -i <your-private-key.pem> ubuntu@${aws_eip.app.public_ip}"
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "route53_nameservers" {
  value       = aws_route53_zone.main.name_servers
  description = "Route53 nameservers - configure these at your domain registrar"
}

output "domain_configuration" {
  value = <<-EOT
    Domain: ${var.domain_name}
    IP Address: ${aws_eip.app.public_ip}
    
    To complete DNS setup:
    1. Update nameservers at your domain registrar to:
       ${join("\n       ", aws_route53_zone.main.name_servers)}
    2. Wait 24-48 hours for DNS propagation
    3. Access your site at: http://${var.domain_name} or http://www.${var.domain_name}
  EOT
}
