import requests
import os

# API endpoint and payload
url = "https://data.sagecontinuum.org/api/v1/query"
payload = {
    "start": "-80h",
    "filter": {
        "vsn": "W017",
        "task": "imagesampler-bottom"
    }
}

# Send the POST request
response = requests.post(url, json=payload)
response.raise_for_status()
data = response.json()

# Extract the image URL from the 'value' field of the first record
try:
    image_url = data[0]['value']
    print(f"Image URL: {image_url}")

    # Get the image data
    img_response = requests.get(image_url)
    img_response.raise_for_status()

    # Save image locally
    filename = os.path.basename(image_url)
    with open(filename, 'wb') as f:
        f.write(img_response.content)
    print(f"Image saved as {filename}")

except (IndexError, KeyError) as e:
    print("Failed to retrieve image URL from response:", e)
