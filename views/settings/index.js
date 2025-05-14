/* eslint-disable no-undef */

AppSettingsPage({
  state: {
    settings: {},
  },
  initSettings() {
    const settings = this.getSettings();
    this.state.settings = settings;
  },
  getSettings() {
    const value = this.state.props.settingsStorage.getItem("settings");
    return value ? JSON.parse(value) : {};
  },
  setSettings() {
    this.state.props.settingsStorage.setItem(
      "settings",
      JSON.stringify(this.state.settings)
    );
  },

  build(props) {
    this.state.props = props;
    this.initSettings();

    return View(
      {
        style: {
          padding: "12px 20px",
        },
      },
      [
        Section(
          {
            title: "Auth",
            description:
              "Warning: Password is not held in secure container, treat with care and do not use existing password",
          },
          [
            TextInput({
              label: "Login",
              placeholder: "",
              value: this.state.settings.login,
              labelStyle: {
                fontWeight: "bold",
              },
              subStyle: {
                minHeight: "30px",
                textDecoration: "underline",
                marginBottom: "10px",
                padding: "5px",
                margin: "5px",
                border: "1px solid #cccccc",
                borderRadius: "5px",
              },
              onChange: (val) => {
                this.state.settings.login = val;
                this.setSettings();
              },
            }),
            TextInput({
              label: "Password",
              placeholder: "",
              value: this.state.settings.password,
              labelStyle: {
                fontWeight: "bold",
              },
              subStyle: {
                minHeight: "30px",
                textDecoration: "underline",
                marginBottom: "10px",
                padding: "5px",
                margin: "5px",
                border: "1px solid #cccccc",
                borderRadius: "5px",
              },
              onChange: (val) => {
                this.state.settings.password = val;
                this.setSettings();
              },
            }),
          ]
        ),
        Section(
          {
            title: "API URLs",
          },
          [
            TextInput({
              label: "auth api",
              placeholder: "",
              value: this.state.settings.authURL,
              labelStyle: {
                fontWeight: "bold",
              },
              subStyle: {
                minHeight: "30px",
                textDecoration: "underline",
                marginBottom: "10px",
                padding: "5px",
                margin: "5px",
                border: "1px solid #cccccc",
                borderRadius: "5px",
              },
              onChange: (val) => {
                this.state.settings.authURL = val;
                this.setSettings();
              },
            }),
            TextInput({
              label: "connections api",
              placeholder: "",
              value: this.state.settings.connectionsURL,
              labelStyle: {
                fontWeight: "bold",
              },
              subStyle: {
                minHeight: "30px",
                textDecoration: "underline",
                marginBottom: "10px",
                padding: "5px",
                margin: "5px",
                border: "1px solid #cccccc",
                borderRadius: "5px",
              },
              onChange: (val) => {
                this.state.settings.connectionsURL = val;
                this.setSettings();
              },
            }),
          ]
        ),
        Link(
          {
            source: "https://github.com/mrklos/NinjaSugar",
          },
          "GitHub Page"
        ),
      ]
    );
  },
});
