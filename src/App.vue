<template>
  <v-app style="overflow: hidden">
    <v-system-bar
      v-if="process.platform != 'darwin'"
      app
      window
      style="-webkit-app-region: drag; -webkit-user-select: none"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#0C4A6E' : 'transparent'"
      class="pr-0"
    >
      <v-fade-transition group leave-absolute>
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important; margin-left: 2px; z-index: 10"
        >
          <img
            src="./assets/logo.png"
            style="margin-right: 4px; margin-top: 3px; height: 18px"
          />
          <span style="margin-top: 2px" class="mr-2">Write</span>
        </div>
        <span
          key="notification"
          v-if="$root.notify.is"
          v-html="$root.notify.text"
        ></span>
      </v-fade-transition>

      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag; margin-bottom: 1px">
        <v-icon @click="minimize()" v-ripple class="toolbar-icon"
          >mdi-minus</v-icon
        >
        <v-icon
          @click="maximized ? unmaximize() : maximize()"
          v-ripple
          class="toolbar-icon"
          >mdi-crop-square</v-icon
        >
        <v-icon @click="close()" v-ripple class="toolbar-icon"
          >mdi-close</v-icon
        >
      </div>
    </v-system-bar>

    <v-system-bar
      v-if="process.platform == 'darwin'"
      app
      window
      style="-webkit-app-region: drag"
      height="38"
      :class="{ 'elevation-3': $root.user }"
      :color="$root.user ? '#0C4A6E' : 'transparent'"
    >
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="close()"
        class="red lighten-1 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="minimize()"
        class="yellow darken-2 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px"
        v-ripple
        @click="maximized ? unmaximize() : maximize()"
        class="green mx-1"
      ></div>
      <v-fade-transition group leave-absolute style="margin: 4px 4px 0px 10px">
        <div
          key="logo"
          v-if="!$root.notify.is"
          style="display: inline-flex !important"
        >
          <img
            src="./assets/logo.png"
            style="height: 24px; margin-right: 4px; margin-top: 1px"
          />
          <span style="margin-right: 4px; margin-top: 3px">Write</span>
        </div>
        <p
          key="notification"
          v-if="$root.notify.is"
          class="mb-1"
          v-html="$root.notify.text"
        ></p>
      </v-fade-transition>
    </v-system-bar>

    <v-main v-if="!$root.user" key="login">
      <div
        style="max-width: 28rem; padding-top: 5rem"
        class="mx-auto text-center"
      >
        <img style="height: 8rem; margin: auto" src="./assets/paradigm.png" />

        <v-card
          class="mt-10"
          color="#333333"
          style="border: none !important; width: 100%"
        >
          <v-card-title>
            <h1 class="text-h4 grey--text text--lighten-1">
              Sign in to your account
            </h1>
          </v-card-title>
          <v-card-text>
            <v-text-field
              hide-details
              label="Username"
              class="mb-3"
              v-model="username"
            ></v-text-field>
            <v-text-field
              hide-details
              label="Password"
              class="mb-6"
              type="password"
              @keypress.enter="signIn()"
              v-model="password"
            ></v-text-field>
            <v-checkbox label="Stay signed in" v-model="sticky"></v-checkbox>

            <v-btn
              elevation="2"
              block
              color="deep-purple darken-4"
              @click="signIn()"
              :disabled="!username || !password"
              >Sign in</v-btn
            >
          </v-card-text>

          <v-card-actions class="grey darken-4 pa-7">
            <p
              class="ma-auto subtitle-2 text-center font-weight-light text--grey text--darken-4"
            >
              Don't have an account?
              <a
                class="text--grey text--darken-4"
                @click="shell.openExternal('https://www.theparadigmdev.com')"
              >
                Create one online</a
              >
            </p>
          </v-card-actions>
        </v-card>
      </div>
    </v-main>

    <v-main v-else style="overflow: hidden"> </v-main>
  </v-app>
</template>

<script>
import { remote } from "electron";
import { io } from "socket.io-client";
import { shell } from "electron";
import Store from "./store.js";

const store = new Store();

export default {
  name: "App",
  data: () => ({
    win: remote.getCurrentWindow(),
    maximized: remote.getCurrentWindow().isMaximized(),
    process,
    username: "",
    password: "",
    sticky: true,

    window,
    shell,
  }),
  async created() {
    if (store.get("jwt")) {
      const jwt = store.get("jwt");
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/verify", {
          jwt,
        })
        .then(async (response) => {
          if (response.data.valid) {
            this.$root.user = response.data.user;
            this.$root.socket.emit("login", this.$root.user.username);
          }
        });
    }
    this.$root.socket.on("user", (data) => {
      if (this.$root.user !== data) this.$root.user = data;
    });
  },
  methods: {
    close() {
      this.win.close();
    },
    maximize() {
      this.win.maximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    unmaximize() {
      this.win.unmaximize();
      this.maximized = remote.getCurrentWindow().isMaximized();
    },
    minimize() {
      this.win.minimize();
    },

    signIn() {
      this.$http
        .post("https://www.theparadigmdev.com/api/authentication/signin", {
          username: this.username.toLowerCase(),
          password: this.password,
          sticky: this.sticky,
        })
        .then(async (response) => {
          if (!response.data.errors) {
            this.$root.user = response.data.user;
            this.username = "";
            this.password = "";
            store.set("jwt", response.data.jwt);
            this.$root.socket.emit("login", this.$root.user.username);
          } else {
            this.$notify(`<span class="red--text">${response.data.msg}</span>`);
          }
        })
        .catch((error) => console.error(JSON.stringify(error)));
    },
    signOut() {
      if (this.$root.user) {
        this.$http
          .post("https://www.theparadigmdev.com/api/authentication/signout", {
            _id: this.$root.user._id,
          })
          .then((response) => {
            this.$root.socket.disconnect();
            this.$root.socket = io.connect("https://www.theparadigmdev.com");
            store.set("jwt", false);
            this.$root.user = false;
          });
      }
    },
  },
};
</script>

<style>
html {
  overflow: hidden !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgb(33, 33, 33);
}
::-webkit-scrollbar-thumb {
  background: rgb(100, 100, 100);
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(60, 60, 60);
}
::-webkit-scrollbar-corner {
  background: rgb(33, 33, 33);
}
</style>