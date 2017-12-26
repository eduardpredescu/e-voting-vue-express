<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-content">
        <h5 class="title is-center">E-voting system</h5>
        <b-field label="Username">
          <b-input type="text" v-model="username" placeholder="username"></b-input>
        </b-field>
        <b-field label="Password">
          <b-input type="text" v-model="password" placeholder="password"></b-input>
        </b-field>
      </div>
      <div class="card-footer">
        <a class="card-footer-item is-success" @click="Login({username, password})">Login</a>
        <router-link class="card-footer-item" :to="{name: 'Register'}">Register</router-link>
      </div>
    </div>
  </div>
</template>



<script>
  export default {
    data () {
      return {
        username: '',
        password: ''
      }
    },
    methods: {
      Login (credentials) {
        this.$store.dispatch('Login', credentials)
        this.$router.push({path: '/'})
      }
    }
  }
</script>

<style lang="scss" scoped>
.card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.container-fluid {
  height: 100vh;
  background-color: hsl(204, 86%, 53%);
}
.card-footer-item {
  &.is-success {
    background-color: hsl(141, 71%, 48%);
    color: #fff;
  }
}
</style>
