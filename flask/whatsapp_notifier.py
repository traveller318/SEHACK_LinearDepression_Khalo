import json
from typing import Dict, List
from pathlib import Path
from twilio.rest import Client
import googleapiclient.discovery


class WhatsAppNotifier:
    def __init__(self):
        self.config = {
            "twilio": {
                "account_sid": "AC368c57df4d6428dfbc9ca00992288e56",
                "auth_token": "6fd8edb12857425bea0a70d6b61bd0fe",
                "whatsapp_number": "whatsapp:+14155238886"
            },
            "youtube_api_key": "AIzaSyCiAxtx5kZnoJ3kvnPyn1w8PO_BCBNR-Ig"  # ← Replace this
        }

    def get_first_youtube_video_link(self, query: str) -> str:
        """Fetch the first YouTube video link using the YouTube Data API"""
        youtube = googleapiclient.discovery.build(
            "youtube", "v3", developerKey=self.config["youtube_api_key"]
        )

        request = youtube.search().list(
            part="snippet",
            maxResults=1,
            q=query,
            type="video"
        )
        response = request.execute()
        items = response.get("items", [])
        if not items:
            return "No video found."

        video_id = items[0]["id"]["videoId"]
        return f"https://www.youtube.com/watch?v={video_id}"

    def find_youtube_videos(self, issues: List[str]) -> Dict[str, str]:
        """Find YouTube video links for each issue"""
        video_links = {}
        for issue in issues:
            search_query = f"{issue} cleaning tutorial food safety"
            link = self.get_first_youtube_video_link(search_query)
            video_links[issue] = link
        return video_links

    def send_whatsapp_message(self, vendor_number: str, report: Dict, video_links: Dict[str, str]) -> str:
        """Send formatted WhatsApp message with improvement resources"""
        client = Client(
            self.config["twilio"]["account_sid"],
            self.config["twilio"]["auth_token"]
        )

        message = (
            "🔍 *Cleanliness Improvement Report* 🔍\n\n"
            f"🏆 *Rating:* {report.get('cleanliness_rating', 'N/A')}/5\n\n"
            "🚨 *Key Issues Found:*\n"
        )

        for issue, link in video_links.items():
            message += f"- {issue}\n  🔗 {link}\n\n"

        message += "💡 *Recommendations:*\n"
        for rec in report.get("recommendations", []):
            message += f"- {rec}\n"

        response = client.messages.create(
            body=message,
            from_=self.config["twilio"]["whatsapp_number"],
            to=f"whatsapp:{vendor_number}"
        )

        return response.sid

    def notify_vendor(self, vendor_number: str, report_data: Dict):
        try:
            if report_data.get("status") != "success":
                print("Report status is not success")
                return

            report = report_data.get("report", {})
            issues = report.get("issues_found", [])
            if not issues:
                print("No issues found in the report")
                return

            print(f"Found {len(issues)} issues - searching for tutorials...")
            video_links = self.find_youtube_videos(issues)

            print(f"Sending WhatsApp to {vendor_number}...")
            message_id = self.send_whatsapp_message(vendor_number, report, video_links)

            print(f"✅ Notification sent successfully! Message ID: {message_id}")
            return True

        except Exception as e:
            print(f"❌ Error sending notification: {str(e)}")
            return False


if __name__ == "__main__":
    notifier = WhatsAppNotifier()

    # Replace with your number in full international format
    VENDOR_NUMBER = "+919326445840"

    # Assuming you have the report data available
    report_data = {
        "status": "success",
        "report": {
            "cleanliness_rating": 8,
            "issues_found": ["Dirty counter", "Uncovered food"],
            "recommendations": ["Clean the counter regularly", "Cover the food"],
            "good_practices": ["Proper handwashing observed"],
            "overall_summary": "The vendor maintains a generally good level of hygiene, but improvements are needed."
        }
    }

    notifier.notify_vendor(VENDOR_NUMBER, report_data)
