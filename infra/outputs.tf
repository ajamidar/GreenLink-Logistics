output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}

output "ec2_ssh_command" {
  value = "ssh -i <your-private-key.pem> ubuntu@${aws_instance.app.public_ip}"
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
