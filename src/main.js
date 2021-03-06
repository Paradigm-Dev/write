import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import io from "socket.io-client";
import Store from "./store";

let socket = io.connect("https://www.theparadigm.ga");
const store = new Store();
Vue.config.productionTip = false;
Vue.prototype.$http = axios;

Vue.mixin({
  methods: {
    $getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    $notify(text) {
      this.$root.notify.text = text;
      this.$root.notify.is = true;
      setTimeout(() => {
        this.$root.notify.text = "";
        this.$root.notify.is = false;
      }, 3000);
    },
    $urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  },
});

new Vue({
  vuetify,
  render: (h) => h(App),
  data() {
    return {
      notify: {
        is: false,
        text: "",
      },
      user: false,
      socket,
    };
  },
}).$mount("#app");
