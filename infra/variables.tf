variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "key_name" {
  type        = string
  description = "EC2 SSH key pair name"
}

variable "public_key" {
  type        = string
  description = "Public key material for EC2 access"
}

variable "admin_cidr" {
  type        = string
  description = "Your public IP in CIDR form for SSH access (example: 203.0.113.10/32)"
}

variable "db_name" {
  type        = string
  description = "Postgres database name"
  default     = "greenlink"
}

variable "db_username" {
  type        = string
  description = "Postgres username"
  default     = "greenlink_admin"
}

variable "db_password" {
  type        = string
  description = "Postgres password"
  sensitive   = true
}

variable "domain_name" {
  type        = string
  description = "Domain name for the application (e.g., greenlink.website)"
  default     = "greenlink.website"
}
