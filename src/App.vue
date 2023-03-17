<template>
  <div id="app">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    </header>

    <main>
      <div
        v-if="loading"
      >
        Getting auth token and attempting to login...
      </div>
      <div
        v-else-if="error"
      >
        {{ error }}
      </div>
      <div
        v-else-if="!username"
      >
        <input v-model="gisOrigin" type="text" id="name" name="name" size="100">
        <p>Hostname: {{ gisOrigin }}</p>
        <div style="margin-top: 20px;"></div>
        <input v-model="clientId" type="text" id="name" name="name" size="100">
        <p>clientId: {{ clientId }}</p>
        <div style="margin-top: 20px;"></div>
        <input v-model="clientSecret" type="text" id="name" name="name" size="100">
        <p>clientSecret: {{ clientSecret }}</p>
        <div style="margin-top: 20px;"></div>
        <a :href="authEndpoint">Login</a>
      </div>
      <div
        v-else
      >
        Successfully logged in as: {{ username }}
      </div>
    </main>
  </div>
</template>

<script>
  import axios from 'axios'
  export default {
    name: 'App',
    data () {
      const redirectUrl = window.encodeURIComponent(location.origin)
      return {
        clientId: 'Txk8DYydVxfsuieL',
        clientSecret: '0f7694366da64580ae453e3497150c8a',
        gisOrigin: 'https://www.arcgis.com/sharing/rest/',
        redirectUrl,
        accessToken: null,
        username: null,
        loading: false,
        error: null
      }
    },
    async mounted () {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code');
      if (code) {
        const postData = { 
          clientId: this.clientId, 
          clientSecret: this.clientSecret,
          redirectUrl: this.redirectUrl, 
          gisOrigin: this.gisOrigin,
          code
        }
        this.loading = true
        try {
          const { data: tokenData } = await axios({ method: 'post', url: 'http://127.0.0.1:3000/validate', data: postData })
          if (tokenData.error) {
            this.error = tokenData.error
          } else if (tokenData?.access_token) {
            const { data: gisData } = await axios.get(`${this.gisOrigin}portals/self?f=pjson&token=${tokenData?.access_token}`)
            if (gisData?.error) {
              this.error = gisData.error
            } else {
              this.username = gisData?.user?.username
            }
          }
        } catch (e) {
          this.error = e
        } finally {
          this.loading = false
        }
      }

    },
    computed: {
      authEndpoint () {
        return `${this.gisOrigin}oauth2/authorize/?client_id=${this.clientId}&response_type=code&expiration=20160&redirect_uri=${this.redirectUrl}`
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

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
