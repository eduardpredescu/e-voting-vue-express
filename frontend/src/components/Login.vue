<template>
  <div class="card">
    <div class="card-content">
    <b-field>
      <b-input label="Username" type="text" v-model="username" placeholder="username"></b-input>
    </b-field>
    <b-field>
      <b-input type="text" v-model="password" placeholder="password"></b-input>
    </b-field>
    <button class="button" @click="Login({username, password})">Login</button>
    <router-link :to="{name: 'Register'}">Register to use the system</router-link>
    </div>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  export default {
    data () {
      return {
        username: '',
        password: ''
      }
    },
    computed: mapGetters(['user']),
    methods: {
      Login (credentials) {
        this.$store.dispatch('Login', credentials)
        this.$router.push({path: '/'})
      }
    }
  }
</script>