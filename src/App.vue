<template>
  <div id="app">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    </header>

    <main>
      <input v-model="argGisEndpointHost" type="text" id="name" name="name" size="100">
      <p>Hostname: {{ argGisEndpointHost }}</p>
      <div style="margin-top: 20px;"></div>
      <input v-model="appId" type="text" id="name" name="name" size="100">
      <p>appId: {{ appId }}</p>
      <div style="margin-top: 20px;"></div>
      <input v-model="appSecret" type="text" id="name" name="name" size="100">
      <p>appSecret: {{ appSecret }}</p>
      <div style="margin-top: 20px;"></div>
      <a :href="authEndpoint">Login</a>
    </main>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'App',
    data () {
      const redirectURL = window.encodeURIComponent(location.origin)
      return {
        appId: 'Txk8DYydVxfsuieL',
        appSecret: 'Txk8DYydVxfsuieLTxk8DYydVxfsuieL',
        argGisEndpointHost: 'https://www.arcgis.com/sharing/rest/',
        redirectURL
      }
    },
    async mounted () {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code');
      if (code) {
        // const postData = { appId: '2', appSecret: 'abcd', id: '2', redirectURL: this.redirectURL, argGisEndpointHost: this.argGisEndpointHost }
        // await axios({ method: 'post', url: 'https://64137572a68505ea733415f1.mockapi.io/api/creds', data: postData })
      }

    },
    computed: {
      authEndpoint () {
        return `${this.argGisEndpointHost}oauth2/authorize/?client_id=${this.appId}&response_type=code&expiration=20160&redirect_uri=${this.redirectURL}`
      }
    }
  }
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

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
