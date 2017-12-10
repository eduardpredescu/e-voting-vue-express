<template>
  <div>
    <input type="text" v-model="username" placeholder="username">
    <input type="text" v-model="password" placeholder="password">
    <button @click="Login({username, password})">Login</button>
  </div>
</template>
<script>
  import { mapActions, mapGetters } from 'vuex'
  export default {
    data () {
      return {
        username: '',
        password: ''
      }
    },
    computed: mapGetters(['user']),
    methods: mapActions(['Login'])
  }
</script>