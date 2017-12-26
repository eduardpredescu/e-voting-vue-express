<template>
  <div id="app">
    <header v-if="$route.path !== '/login' && $route.path !== '/register'">
      <nav class="navbar is-info" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <!-- navbar items, navbar burger... -->
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <a class="navbar-item" href="https://bulma.io/">
              Home
            </a>
            <a class="navbar-item" href="https://bulma.io/">
              Home
            </a>
          </div>
        </div>
      </nav>
    </header>
    <main>
      <div class="container">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>


</style>
