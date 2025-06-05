import smtplib
import logging
import time
from email.mime.text import MIMEText

# SMTP server configuration
smtp_server = 'mail.blue-marble.com'
smtp_port = 1025
smtp_user = 'dash.hound@blue-marble.com'
smtp_password = '2019*Sushi'

# Email content
msg = MIMEText('This is a test email from Lightsail.')
msg['Subject'] = 'Test Email'
msg['From'] = smtp_user
msg['To'] = 'john.zeerak@ucdenver.com'

# Configure logging
logging.basicConfig(
    filename='email_debug.log',
    filemode='w',
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logging.info("Starting email script...")

try:
    logging.info(f"Connecting to SMTP server {smtp_server}:{smtp_port}")
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()
        logging.info("EHLO command sent")

        # Log the response to EHLO
        code, message = server.docmd("EHLO", "mail.blue-marble.com")
        logging.info(f"EHLO response: {code} - {message.decode()}")

        # Attempt login
        logging.info("Attempting to log in")
        time.sleep(2)
        server.login(smtp_user, smtp_password)
        logging.info("Login successful")

        # Send email
        logging.info(f"Sending email to {msg['To']}")
        server.sendmail(smtp_user, [msg['To']], msg.as_string())
        logging.info("Email sent successfully")

except smtplib.SMTPAuthenticationError as e:
    logging.error(f"SMTP Authentication Error: {e}")
    print(f"Failed to send email: {e}")
except smtplib.SMTPException as e:
    logging.error(f"SMTP Error: {e}")
except Exception as e:
    logging.error(f"Unexpected error: {e}")
finally:
    logging.info("Script completed.")
