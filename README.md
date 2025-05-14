# NinjaSugar
App for zepp-os based smartwatches. Fetches glucose values from libre api and displays it on watch widget. Has alarm function if glucose is not in range for long

# Known limitations
1. Not stable, application stops fetching sugar from time to time. Do not use as medical app
2. App uses libre api, which can be changed without notice. Do not use as medical app
3. App requires phone network to work correctly. Do not use as medical app
4. Values are shown with minimum 1-2 minutes delay. Do not use as medical app
5. Alerts are fixed to on state with 20 mins delay for hights and 15 mins for lows, feel free to change in code.
6. App tested on amazfit balance watch

# Installation
Refer to https://docs.zepp.com/docs/guides/tools/cli/
Fastest way is to use developer's preview mode.
1. Clone repo
2. install zeus from above link
3. use zeus preview command
4. refer to link above how to use created QR to install app

# Running
Before starting you need libre link-up account created and set as receiver of your sugar data in librelink.
After go to settings (Zepp application on phone -> programmers mode -> NinjaSugar -> Settings) and fill login and password for created account in libre link-up. 
Also paste urls for auth (https://libreview-unofficial.stoplight.io/docs/libreview-unofficial/bbeb6c0f9327a-log-in) and connections api url (https://libreview-unofficial.stoplight.io/docs/libreview-unofficial/a0172db013fc3-get-connections) Use correct url for Your location, for example use api-us or api-eu.
After saving, open application on watch and press start. If auth and url's are correct, you should see glucose soon.

# Widget
App has widget, to add it to watch, in zepp application go to settings, widgets, press + symbol next to unnamed row (todo)
