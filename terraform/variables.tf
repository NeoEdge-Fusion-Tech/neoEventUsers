variable "aws_region" {
  description = "The AWS region to deploy the frontend to"
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (prod, staging, dev)"
  default     = "prod"
}
