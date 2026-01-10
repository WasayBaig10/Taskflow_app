"""
Email service for sending transactional emails.

Uses SMTP for sending emails. In production, consider using:
- SendGrid, Mailgun, AWS SES, or other email service providers
"""
import aiosmtplib
from email.message import EmailMessage
from typing import Optional
import os
from src.config import settings


async def send_password_reset_email(email: str, reset_token: str, frontend_url: str = "http://localhost:3002") -> bool:
    """
    Send a password reset email to the user.

    Args:
        email: User's email address
        reset_token: Password reset token
        frontend_url: Frontend URL for constructing the reset link

    Returns:
        True if email was sent successfully, False otherwise
    """
    if not settings.emails_enabled:
        print(f"Email sending disabled. Would send reset email to: {email}")
        print(f"Reset token: {reset_token}")
        return True

    if not settings.email_username or not settings.email_password:
        print("Email credentials not configured. Skipping email send.")
        print(f"RESET TOKEN FOR {email}: {reset_token}")
        return True  # Return True to not break the flow in demo mode

    try:
        # Create the email message
        message = EmailMessage()
        message["From"] = f"{settings.email_from_name} <{settings.email_from or settings.email_username}>"
        message["To"] = email
        message["Subject"] = "Reset Your TaskFlow Password"

        # Construct the reset link
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        # HTML email body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 40px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #2563eb;
                }}
                h1 {{
                    color: #1f2937;
                    font-size: 24px;
                    margin-bottom: 20px;
                }}
                p {{
                    margin-bottom: 16px;
                    color: #4b5563;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #2563eb;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .button:hover {{
                    background-color: #1d4ed8;
                }}
                .footer {{
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                }}
                .warning {{
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 12px;
                    margin: 20px 0;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">TaskFlow</div>
                </div>

                <h1>Reset Your Password</h1>

                <p>Hello,</p>

                <p>We received a request to reset the password for your TaskFlow account. Click the button below to choose a new password:</p>

                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb; font-size: 14px;">{reset_link}</p>

                <div class="warning">
                    <strong>Important:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.
                </div>

                <div class="footer">
                    <p>If you're having trouble clicking the password reset button, copy and paste the URL above into your web browser.</p>
                    <p>&copy; 2026 TaskFlow. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text alternative
        text_body = f"""
        Reset Your TaskFlow Password

        Hello,

        We received a request to reset the password for your TaskFlow account. Click the link below to choose a new password:

        {reset_link}

        If you're having trouble clicking the link, copy and paste the URL into your web browser.

        Important: This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email.

        © 2026 TaskFlow. All rights reserved.
        """

        message.set_content(text_body)
        message.add_alternative(html_body, subtype="html")

        # Send the email
        await aiosmtplib.send(
            message,
            hostname=settings.email_host,
            port=settings.email_port,
            username=settings.email_username,
            password=settings.email_password,
            start_tls=True,
        )

        print(f"Password reset email sent successfully to: {email}")
        return True

    except Exception as e:
        print(f"Failed to send password reset email to {email}: {str(e)}")
        print(f"RESET TOKEN FOR {email}: {reset_token}")
        # In demo mode, we don't want to fail the entire flow if email sending fails
        return True


async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Generic email sending function.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML email body
        text_body: Optional plain text alternative

    Returns:
        True if email was sent successfully, False otherwise
    """
    if not settings.emails_enabled:
        print(f"Email sending disabled. Would send email to: {to_email}")
        return True

    if not settings.email_username or not settings.email_password:
        print("Email credentials not configured. Skipping email send.")
        return True

    try:
        message = EmailMessage()
        message["From"] = f"{settings.email_from_name} <{settings.email_from or settings.email_username}>"
        message["To"] = to_email
        message["Subject"] = subject

        message.set_content(text_body or html_body)
        message.add_alternative(html_body, subtype="html")

        await aiosmtplib.send(
            message,
            hostname=settings.email_host,
            port=settings.email_port,
            username=settings.email_username,
            password=settings.email_password,
            start_tls=True,
        )

        print(f"Email sent successfully to: {to_email}")
        return True

    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False
