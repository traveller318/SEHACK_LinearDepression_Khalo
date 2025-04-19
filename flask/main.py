from flask import Flask, request, jsonify
from cleanliness import generate_cleanliness_report  # Import the generate report function
from whatsapp_notifier import WhatsAppNotifier  # Import the WhatsApp notifier class

app = Flask(__name__)

@app.route('/generate_report', methods=['POST'])
def generate_report():
    try:
        # Get image paths and vendor number from the request
        data = request.get_json()
        image_paths = data['image_paths']
        vendor_number = data['vendor_number']

        # Ensure that we have 5 images
        if len(image_paths) != 5:
            return jsonify({'status': 'error', 'message': 'Exactly 5 images are required'}), 400

        # Generate the cleanliness report
        report_data = generate_cleanliness_report(image_paths)

        if report_data['status'] != 'success':
            return jsonify(report_data), 400

        # Pass the report to WhatsAppNotifier
        notifier = WhatsAppNotifier()
        success = notifier.notify_vendor(vendor_number, report_data)

        if not success:
            return jsonify({'status': 'error', 'message': 'Failed to send WhatsApp notification'}), 500

        # Return the final report in JSON format
        return jsonify(report_data['report']), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
