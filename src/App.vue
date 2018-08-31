<template>
  <div id="app">
    <web3-check :networks="[network]">
      <router-view />
    </web3-check>
  </div>
</template>

<script>
import * as config from './config'

export default {
  name: 'App',
  data () {
    return {
      network: config.NETWORK
    }
  }
}
</script>

<style>
  body {
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 14px;
    line-height: 1.42857143;
    color: #333;
    background-color: #fff;
  }
</style>
