<template>
  <div id="app">
    <header>
      <img
        alt="Vue logo"
        class="logo"
        src="./assets/logo.svg"
        width="125"
        height="125"
      />
    </header>

    <main>
      <div v-if="loading">Getting auth token and attempting to login...</div>
      <div v-else-if="error">
        {{ error }}
      </div>
      <div v-else-if="!username">
        <input v-model="portalUrl" type="text" size="100" />
        <p>Portal URL</p>
        <div style="margin-top: 20px"></div>
        <input v-model="clientId" type="text" size="100" />
        <p>Client ID</p>
        <div style="margin-top: 20px"></div>
        <input v-model="clientSecret" type="text" size="100" />
        <p>Client Secret</p>
        <div style="margin-top: 20px"></div>
        <input type="radio" v-model="authType" value="sdk" />Esri SDK
        <input type="radio" v-model="authType" value="client" />Client
        <input type="radio" v-model="authType" value="server" />Server
        <p>Auth Type</p>
        <div style="margin-top: 20px"></div>
        <button @click="onAuthEndpoint">Login</button>
        <div style="width: 200px">{{ authEndpoint }}</div>
      </div>
      <div v-else>
        <p>Successfully logged in as: {{ username }}</p>
        <button @click="logout">Log out</button>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import Portal from "@arcgis/core/portal/Portal.js";
export default {
  name: "App",
  data() {
    const redirectUrl = window.encodeURIComponent(location.origin);
    return {
      clientId:
        window.location.hostname === "localhost"
          ? "Txk8DYydVxfsuieL"
          : "PbmgNTzO0J3Cx4Bw",
      clientSecret:
        window.location.hostname === "localhost"
          ? "0f7694366da64580ae453e3497150c8a"
          : "31ab93b2c2cf459c80f21e13d8cacfa0",
      codeValidateEndpoint:
        window.location.hostname === "localhost"
          ? "http://127.0.0.1:3000/validate"
          : "https://dfe6ud80mf.execute-api.us-east-1.amazonaws.com/api/validate",
      portalUrl:
        window.location.hostname === "localhost"
          ? "https://arcgis.com/"
          : "https://gisweb1.fortisbctest.com/fbcportal/",
      authType: "sdk",
      redirectUrl,
      accessToken: null,
      username: null,
      loading: false,
      error: null,
    };
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    const hash = window.location.hash.substring(1);
    const hashResult = hash.split("&").reduce(function (res, item) {
      var parts = item.split("=");
      if (parts[0]) {
        res[parts[0]] = parts[1];
      }
      return res;
    }, {});
    const gisAppData = JSON.parse(window.sessionStorage.getItem("gisAddData"));
    console.log('onMount gisAppData', gisAppData)
    if (code) {
      const postData = {
        ...gisAppData,
        code,
      };
      this.loading = true;
      try {
        const { data: tokenData } = await axios({
          method: "post",
          url: this.codeValidateEndpoint,
          data: postData,
        });
        if (tokenData.error) {
          this.error = tokenData.error;
        } else if (tokenData?.access_token) {
          const { data: gisData } = await axios.get(
            `${this.portalUrl}sharing/rest/portals/self?f=pjson&token=${tokenData?.access_token}`
          );
          if (gisData?.error) {
            this.error = gisData.error;
          } else {
            this.username = gisData?.user?.username;
            // Remove query params
            window.history.replaceState(null, null, window.location.pathname);
          }
        }
      } catch (e) {
        this.error = e;
      } finally {
        this.loading = false;
      }
    } else if (hashResult.access_token) {
      const { data: gisData } = await axios.get(
        `${gisAppData.portalUrl}sharing/rest/portals/self?f=pjson&token=${hashResult.access_token}`
      );
      if (gisData?.error) {
        this.error = gisData.error;
      } else {
        this.username = gisData?.user?.username;
        // Remove query params
        window.history.replaceState(null, null, window.location.pathname);
      }
    } else {
      // Check esri sdk stuff
      try {
        console.log("Generating info object...");
        const info = this.generateInfo(gisAppData?.portalUrl, gisAppData?.clientId);
        console.log("info", info);
        console.log("[registerOAuthInfos]...");
        esriId.registerOAuthInfos([info]);
        console.log("[registerOAuthInfos] success!");
        console.log("[checkSignInStatus]...");
        const creds = await esriId.checkSignInStatus(
          info.portalUrl + "/sharing"
        );
        console.log("[checkSignInStatus] success!", creds);
        this.displayItems();
      } catch (e) {
        console.log(e);
      } finally {
        window.sessionStorage.setItem("gisAddData", null);
      }
    }
  },
  computed: {
    authEndpoint() {
      if (this.authType === "server") {
        return `${this.portalUrl}sharing/rest/oauth2/authorize/?client_id=${this.clientId}&response_type=code&expiration=20160&redirect_uri=${this.redirectUrl}`;
      } else if (this.authType === "client") {
        return `${this.portalUrl}sharing/rest/oauth2/authorize/?client_id=${this.clientId}&response_type=token&expiration=20160&redirect_uri=${this.redirectUrl}`;
      }
    },
  },
  methods: {
    async displayItems() {
      const portal = new Portal();
      // Once loaded, user is signed in
      try {
        await portal.load();
        this.username = portal.user.username;
      } catch (error) {
        console.error(error);
      }
    },
    generateInfo(portalUrl = null, appId = null) {
      const info = portalUrl
        ? {
            // Swap this ID out with registered application ID
            appId,
            // Uncomment the next line and update if using your own portal
            portalUrl: pUrl,
            // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
            // authNamespace: "portal_oauth_inline",
            flowType: "auto", // default that uses two-step flow
            popup: false,
          }
        : {
            // Swap this ID out with registered application ID
            appId,
            // Uncomment the next line to prevent the user's signed in state from being shared with other apps on the same domain with the same authNamespace value.
            // authNamespace: "portal_oauth_inline",
            flowType: "auto", // default that uses two-step flow
            popup: false,
          };
      return new OAuthInfo(info);
    },
    async onAuthEndpoint() {
      if (this.authType === "client" || this.authType === "server") {
        const gisAppData = {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          redirectUrl: this.redirectUrl,
          portalUrl: this.portalUrl,
        };
        window.sessionStorage.setItem("gisAddData", JSON.stringify(gisAppData));
        location.assign(this.authEndpoint);
      } else if (this.authType === "sdk") {
        console.log("Generating info object...");
        const portalUrl = this.portalUrl || null
        const appId = this.appId || null
        const info = this.generateInfo(portalUrl, appId);
        console.log("info", info);
        const gisAppData = {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          redirectUrl: this.redirectUrl,
          portalUrl: info.portalUrl,
        };
        window.sessionStorage.setItem("gisAddData", JSON.stringify(gisAppData));
        console.log("[registerOAuthInfos]...");
        esriId.registerOAuthInfos([info]);
        try {
          console.log("[checkSignInStatus]...");
          const creds = await esriId.checkSignInStatus(
            info.portalUrl + "/sharing"
          );
          console.log("[checkSignInStatus] success!", creds);
          this.displayItems();
        } catch (e) {
          console.log("[checkSignInStatus] fail");
          console.log(e);
          // user will be redirected to OAuth sign-in page
          try {
            console.log("[getCredential]...");
            await esriId.getCredential(info.portalUrl + "/sharing", {
              oAuthPopupConfirmation: false,
            });
            console.log("[getCredential] success!");
            this.displayItems();
          } catch (error) {
            console.log(error);
          }
        }
      }
    },
    logout() {
      esriId.destroyCredentials();
      window.location.reload();
    },
  },
};
</script>


<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
