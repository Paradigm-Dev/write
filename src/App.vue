<template>
  <v-app style="overflow: hidden">
    <v-system-bar
      v-if="process.platform != 'darwin'"
      app
      window
      style="-webkit-app-region: drag; -webkit-user-select: none"
      height="38"
      :class="{ 'elevation-3': $root.user && !current }"
      :color="$root.user ? 'blue darken-4' : 'transparent'"
      class="pr-0 d-print-none"
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
      <input
        v-if="current"
        v-model="title"
        class="text-center grey--text text--lighten-1"
        style="width: 100vw; position: absolute"
      />

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
      :class="{ 'elevation-3': $root.user && !current }"
      :color="$root.user ? 'blue darken-4' : 'transparent'"
      class="d-print-none"
    >
      <div
        style="
          height: 12px;
          width: 12px;
          border-radius: 12px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        v-ripple
        @click="close()"
        class="red lighten-1 mx-1"
      >
        <div
          v-if="change"
          style="height: 5px; width: 5px; border-radius: 6px; z-index: 101"
          v-ripple
          @click="close()"
          class="red darken-4 mx-1"
        ></div>
      </div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px; z-index: 100"
        v-ripple
        @click="minimize()"
        class="yellow darken-2 mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px; z-index: 100"
        v-ripple
        @click="maximized ? unmaximize() : maximize()"
        class="green mx-1"
      ></div>
      <div
        style="height: 12px; width: 12px; border-radius: 12px; z-index: 100"
        v-ripple
        @click="closeDocument()"
        v-if="current"
        class="grey mx-1"
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

      <input
        v-if="current"
        v-model="title"
        class="text-center grey--text text--lighten-1"
        style="width: 100vw; position: absolute"
      />
    </v-system-bar>

    <v-main v-if="!$root.user" key="login" class="d-print-none">
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
                @click="shell.openExternal('https://www.theparadigm.ga')"
              >
                Create one online</a
              >
            </p>
          </v-card-actions>
        </v-card>
      </div>
    </v-main>

    <v-main v-else style="overflow: hidden">
      <main v-if="!current && recent_files" class="d-print-none">
        <v-container style="max-width: 876px">
          <h3 class="text-h3 mt-12 font-weight-light">
            Welcome,
            <span
              class="font-weight-regular"
              :style="{ color: $root.user.color }"
              >{{ $root.user.username }}</span
            >
          </h3>

          <!-- <v-row> -->
          <!-- <v-col cols="9"> -->
          <p class="mt-6 mb-1 grey--text">Recent files</p>
          <div v-if="recent_files.length == 0" class="text-center mt-12">
            <v-img
              height="125"
              width="125"
              src="./assets/no_recents.png"
              class="ma-auto mb-5"
            ></v-img>
            <h4 class="text-h4 mb-5">You haven't opened any files recently</h4>
            <v-btn color="blue darken-2" @click="openOpenDialog()">Open</v-btn>
          </div>
          <v-list class="transparent" nav>
            <v-list-item
              @click.stop
              @mouseover="recent_file_hover = index"
              @mouseleave="recent_file_hover = -1"
              v-for="(file, index) in recent_files"
              :key="index"
              v-ripple
              style="cursor: pointer"
            >
              <v-list-item-content @click="openDocument(file.path)">
                <v-list-item-title>{{ file.title }}</v-list-item-title>
                <v-list-item-subtitle class="grey--text text--darken-1">{{
                  file.path
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-btn
                color="grey"
                v-if="recent_file_hover == index"
                icon
                x-small
                @click="removeFromRecents(index)"
              >
                <v-icon size="15">mdi-close</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
          <!-- </v-col> -->

          <!-- <v-col cols="3"> -->
          <!-- <v-btn large>Sign out</v-btn> -->
          <!-- </v-col> -->
          <!-- </v-row> -->

          <v-btn fab fixed bottom left @click="openOpenDialog()"
            ><v-icon>mdi-folder-open</v-icon></v-btn
          >

          <v-btn
            color="blue darken-4"
            fab
            fixed
            bottom
            right
            @click="newDocument()"
            ><v-icon>mdi-plus</v-icon></v-btn
          >
        </v-container>
      </main>

      <main v-else>
        <v-toolbar
          dense
          color="blue darken-4"
          style="z-index: 1"
          class="d-print-none"
        >
          <v-tabs v-model="tab" color="white">
            <v-tabs-slider color="white"></v-tabs-slider>

            <v-tab>File</v-tab>
            <v-tab>Format</v-tab>
            <v-tab>Insert</v-tab>
            <v-tab>Layout</v-tab>
            <v-tab>Review</v-tab>
            <v-tab v-if="tiptap.isActive('table')">Table</v-tab>
            <v-tab>Settings</v-tab>
            <v-tab>Help</v-tab>
          </v-tabs>
        </v-toolbar>

        <v-toolbar
          v-if="current"
          dense
          color="grey darken-4"
          class="d-print-none"
        >
          <v-tabs-items class="transparent" v-model="tab">
            <v-tab-item>
              <v-btn large text tile @click="saveDocument()"
                ><v-icon class="mr-2 ml-n2">mdi-content-save</v-icon>Save</v-btn
              >

              <v-btn large text tile @click="openOpenDialog()"
                ><v-icon class="mr-2 ml-n2">mdi-folder-open</v-icon>Open</v-btn
              >

              <v-btn large text tile @click="newDocument()"
                ><v-icon class="mr-2 ml-n2">mdi-plus</v-icon>New</v-btn
              >

              <v-btn large text tile @click="printDocument()"
                ><v-icon class="mr-2 ml-n2">mdi-printer</v-icon>Print</v-btn
              >
            </v-tab-item>

            <v-tab-item class="transparent">
              <v-btn
                class="font-weight-light"
                icon
                tile
                @click="tiptap.chain().focus().undo().run()"
                ><v-icon>mdi-undo</v-icon></v-btn
              >
              <v-btn icon tile @click="tiptap.chain().focus().redo().run()"
                ><v-icon>mdi-redo</v-icon></v-btn
              >

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text large tile v-bind="attrs" v-on="on">
                    <v-icon class="mr-2 ml-n2" style="margin-bottom: -2px"
                      >mdi-format-font</v-icon
                    >
                    <span
                      v-if="
                        tiptap.isActive('textStyle', {
                          fontFamily: 'Roboto Slab',
                        })
                      "
                      >Roboto Slab</span
                    >
                    <span
                      v-else-if="
                        tiptap.isActive('textStyle', {
                          fontFamily: 'Roboto Condensed',
                        })
                      "
                      >Roboto Condensed</span
                    >
                    <span
                      v-else-if="
                        tiptap.isActive('textStyle', {
                          fontFamily: 'Roboto Mono',
                        })
                      "
                      >Roboto Mono</span
                    >
                    <span
                      v-else-if="
                        tiptap.isActive('textStyle', { fontFamily: 'Roboto' })
                      "
                      >Roboto</span
                    >
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Font</v-subheader>
                  <v-list-item
                    @click="
                      tiptap.chain().focus().setFontFamily('Roboto').run()
                    "
                    :input-value="
                      tiptap.isActive('textStyle', { fontFamily: 'Roboto' })
                    "
                  >
                    <v-list-item-icon style="font-family: 'Roboto'"
                      >Aa</v-list-item-icon
                    >
                    <v-list-item-title>Roboto</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="
                      tiptap.chain().focus().setFontFamily('Roboto Slab').run()
                    "
                    :input-value="
                      tiptap.isActive('textStyle', {
                        fontFamily: 'Roboto Slab',
                      })
                    "
                  >
                    <v-list-item-icon style="font-family: 'Roboto Slab'"
                      >Aa</v-list-item-icon
                    >
                    <v-list-item-title>Roboto Slab</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="
                      tiptap
                        .chain()
                        .focus()
                        .setFontFamily('Roboto Condensed')
                        .run()
                    "
                    :input-value="
                      tiptap.isActive('textStyle', {
                        fontFamily: 'Roboto Condensed',
                      })
                    "
                  >
                    <v-list-item-icon style="font-family: 'Roboto Condensed'"
                      >Aa</v-list-item-icon
                    >
                    <v-list-item-title>Roboto Condensed</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="
                      tiptap.chain().focus().setFontFamily('Roboto Mono').run()
                    "
                    :input-value="
                      tiptap.isActive('textStyle', {
                        fontFamily: 'Roboto Mono',
                      })
                    "
                  >
                    <v-list-item-icon style="font-family: 'Roboto Mono'"
                      >Aa</v-list-item-icon
                    >
                    <v-list-item-title>Roboto Mono</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-btn
                icon
                tile
                @click="tiptap.chain().focus().toggleBold().run()"
                :input-value="tiptap.isActive('bold')"
                ><v-icon>mdi-format-bold</v-icon></v-btn
              >
              <v-btn
                icon
                tile
                @click="tiptap.chain().focus().toggleItalic().run()"
                :input-value="tiptap.isActive('italic')"
                ><v-icon>mdi-format-italic</v-icon></v-btn
              >
              <v-btn
                icon
                tile
                @click="tiptap.chain().focus().toggleUnderline().run()"
                :input-value="tiptap.isActive('underline')"
                ><v-icon>mdi-format-underline</v-icon></v-btn
              >
              <v-btn
                icon
                tile
                @click="tiptap.chain().focus().toggleStrike().run()"
                :input-value="tiptap.isActive('strike')"
                ><v-icon>mdi-format-strikethrough</v-icon></v-btn
              >
              <v-btn
                icon
                tile
                @click="tiptap.chain().focus().unsetAllMarks().run()"
                ><v-icon>mdi-format-clear</v-icon></v-btn
              >

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon>mdi-format-line-spacing</v-icon>
                  </v-btn>
                </template>
                <v-list dense width="125">
                  <v-subheader class="mt-n2">Line Spacing</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().setLineSpacing('25px').run()"
                    :input-value="
                      tiptap.isActive('textStyle', { lineSpacing: '25px' })
                    "
                  >
                    <v-list-item-title>1x</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().setLineSpacing('35px').run()"
                    :input-value="
                      tiptap.isActive('textStyle', { lineSpacing: '35px' })
                    "
                  >
                    <v-list-item-title>1.5x</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().setLineSpacing('45px').run()"
                    :input-value="
                      tiptap.isActive('textStyle', { lineSpacing: '45px' })
                    "
                  >
                    <v-list-item-title>2x</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().setLineSpacing('55px').run()"
                    :input-value="
                      tiptap.isActive('textStyle', { lineSpacing: '55px' })
                    "
                  >
                    <v-list-item-title>2.5x</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon v-if="tiptap.isActive({ textAlign: 'left' })"
                      >mdi-format-align-left</v-icon
                    >
                    <v-icon v-if="tiptap.isActive({ textAlign: 'center' })"
                      >mdi-format-align-center</v-icon
                    >
                    <v-icon v-if="tiptap.isActive({ textAlign: 'right' })"
                      >mdi-format-align-right</v-icon
                    >
                    <v-icon v-if="tiptap.isActive({ textAlign: 'justify' })"
                      >mdi-format-align-justify</v-icon
                    >
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Alignment</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().setTextAlign('left').run()"
                    :input-value="tiptap.isActive({ textAlign: 'left' })"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-align-left</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Left</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().setTextAlign('center').run()"
                    :input-value="tiptap.isActive({ textAlign: 'center' })"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-format-align-center</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Center</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().setTextAlign('right').run()"
                    :input-value="tiptap.isActive({ textAlign: 'right' })"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-align-right</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Right</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="
                      tiptap.chain().focus().setTextAlign('justify').run()
                    "
                    :input-value="tiptap.isActive({ textAlign: 'justify' })"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-format-align-justify</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Justify</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon v-if="tiptap.isActive('orderedList')"
                      >mdi-format-list-numbered</v-icon
                    >
                    <v-icon v-else-if="tiptap.isActive('taskList')"
                      >mdi-format-list-checkbox</v-icon
                    >
                    <v-icon v-else>mdi-format-list-bulleted</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Lists</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().clearNodes().run()"
                    :input-value="
                      !tiptap.isActive('bulletList') &&
                      !tiptap.isActive('orderedList') &&
                      !tiptap.isActive('taskList')
                    "
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-close</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>None</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="tiptap.chain().focus().toggleBulletList().run()"
                    :input-value="tiptap.isActive('bulletList')"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-format-list-bulleted</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Bulleted</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().toggleOrderedList().run()"
                    :input-value="tiptap.isActive('orderedList')"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-format-list-numbered</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Numbered</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().toggleTaskList().run()"
                    :input-value="tiptap.isActive('taskList')"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-format-list-checkbox</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Checklist</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text tile large v-bind="attrs" v-on="on">
                    <v-icon
                      class="mr-2 ml-n2"
                      style="margin-bottom: -2px"
                      v-if="tiptap.isActive('paragraph')"
                      >mdi-format-paragraph</v-icon
                    >
                    <v-icon
                      class="mr-2 ml-n2"
                      style="margin-bottom: -2px"
                      v-if="tiptap.isActive('heading', { level: 1 })"
                      >mdi-format-header-1</v-icon
                    >
                    <v-icon
                      class="mr-2 ml-n2"
                      style="margin-bottom: -2px"
                      v-if="tiptap.isActive('heading', { level: 2 })"
                      >mdi-format-header-2</v-icon
                    >
                    <v-icon
                      class="mr-2 ml-n2"
                      style="margin-bottom: -2px"
                      v-if="tiptap.isActive('heading', { level: 3 })"
                      >mdi-format-header-3</v-icon
                    >
                    <span v-if="tiptap.isActive('paragraph')">Paragraph</span>
                    <span v-if="tiptap.isActive('heading', { level: 1 })"
                      >Header 1</span
                    >
                    <span v-if="tiptap.isActive('heading', { level: 2 })"
                      >Header 2</span
                    >
                    <span v-if="tiptap.isActive('heading', { level: 3 })"
                      >Header 3</span
                    >
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Styles</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().setParagraph().run()"
                    :input-value="tiptap.isActive('paragraph')"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-paragraph</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Paragraph</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="
                      tiptap.chain().focus().toggleHeading({ level: 1 }).run()
                    "
                    :input-value="tiptap.isActive('heading', { level: 1 })"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-header-1</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Header 1</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="
                      tiptap.chain().focus().toggleHeading({ level: 2 }).run()
                    "
                    :input-value="tiptap.isActive('heading', { level: 2 })"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-header-2</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Header 2</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="
                      tiptap.chain().focus().toggleHeading({ level: 3 }).run()
                    "
                    :input-value="tiptap.isActive('heading', { level: 3 })"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-format-header-3</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Header 3</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon tile v-bind="attrs" v-on="on">
                    <v-icon>mdi-palette</v-icon>
                  </v-btn>
                </template>

                <v-color-picker
                  value="#FFFFFF"
                  @update:color="
                    tiptap.chain().focus().setColor($event.hex).run()
                  "
                ></v-color-picker>
              </v-menu>
            </v-tab-item>

            <v-tab-item>
              <v-btn large text tile @click="image_dialog.open = true"
                ><v-icon class="mr-2 ml-n2">mdi-image</v-icon>Image</v-btn
              >
              <v-btn
                large
                text
                tile
                @click="link_dialog = { open: true, url: '' }"
                ><v-icon class="mr-2 ml-n2">mdi-link</v-icon>Link</v-btn
              >

              <v-btn
                large
                text
                tile
                @click="tiptap.chain().focus().setHorizontalRule().run()"
                ><v-icon class="mr-2 ml-n2">mdi-minus</v-icon>Line</v-btn
              >

              <v-btn
                large
                text
                tile
                @click="tiptap.chain().focus().insertTable().run()"
                ><v-icon class="mr-2 ml-n2">mdi-table</v-icon>Table</v-btn
              >
            </v-tab-item>

            <v-tab-item>
              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2">mdi-border-outside</v-icon
                >Margins</v-btn
              >

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2">mdi-phone-rotate-landscape</v-icon
                >Orientation</v-btn
              >

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2">mdi-resize</v-icon>Size</v-btn
              >
            </v-tab-item>

            <v-tab-item>
              <v-btn icon tile disabled>
                <v-icon>mdi-find-replace</v-icon>
              </v-btn>

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2" style="margin-bottom: -2px"
                  >mdi-spellcheck</v-icon
                >Spellcheck</v-btn
              >

              <v-btn icon tile disabled>
                <v-icon>mdi-book-alphabet</v-icon>
              </v-btn>

              <v-btn icon tile disabled>
                <v-icon>mdi-pound</v-icon>
              </v-btn>

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2">mdi-translate</v-icon
                >Translate</v-btn
              >

              <v-btn icon tile disabled>
                <v-icon>mdi-share-variant</v-icon>
              </v-btn>
            </v-tab-item>

            <v-tab-item v-if="tiptap.isActive('table')">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text large tile v-bind="attrs" v-on="on">
                    <v-icon class="mr-2 ml-n2">mdi-plus</v-icon>Insert
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Insert</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().addColumnBefore().run()"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-table-column-plus-before</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Add Column Before</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="tiptap.chain().focus().addColumnAfter().run()"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-table-column-plus-after</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Add Column After</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    @click="tiptap.chain().focus().addRowBefore().run()"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-table-row-plus-before</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Add Row Above</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="tiptap.chain().focus().addRowAfter().run()"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-table-row-plus-after</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Add Row Below</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text large tile v-bind="attrs" v-on="on">
                    <v-icon class="mr-2 ml-n2">mdi-close</v-icon>Remove
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Remove</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().deleteColumn().run()"
                  >
                    <v-list-item-icon
                      ><v-icon
                        >mdi-table-column-remove</v-icon
                      ></v-list-item-icon
                    >
                    <v-list-item-title>Delete Column</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="tiptap.chain().focus().deleteRow().run()"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-table-row-remove</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Delete Row</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    @click="tiptap.chain().focus().deleteTable().run()"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-table-remove</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Delete Table</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text large tile v-bind="attrs" v-on="on">
                    <v-icon class="mr-2 ml-n2">mdi-table</v-icon>Headers
                  </v-btn>
                </template>
                <v-list dense>
                  <v-subheader class="mt-n2">Headers</v-subheader>
                  <v-list-item
                    @click="tiptap.chain().focus().toggleHeaderColumn().run()"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-table-column</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Toggle Header Column</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    @click="tiptap.chain().focus().toggleHeaderRow().run()"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-table-row</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Toggle Header Row</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    @click="tiptap.chain().focus().toggleHeaderCell().run()"
                  >
                    <v-list-item-icon
                      ><v-icon>mdi-table-column-width</v-icon></v-list-item-icon
                    >
                    <v-list-item-title>Toggle Header Cell</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-btn
                text
                large
                tile
                @click="tiptap.chain().focus().mergeOrSplit().run()"
              >
                <v-icon class="mr-2 ml-n2">mdi-table-merge-cells</v-icon
                >Merge/Split Cells
              </v-btn>
            </v-tab-item>

            <v-tab-item>
              <v-menu offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn large text tile v-bind="attrs" v-on="on"
                    ><v-icon class="mr-2 ml-n2" style="margin-bottom: -2px"
                      >mdi-magnify-plus-outline</v-icon
                    >Zoom</v-btn
                  >
                </template>
                <v-card>
                  <v-slider
                    v-if="current.settings"
                    class="pa-3"
                    hide-details
                    style="width: 200px"
                    :min="0.01"
                    :max="2"
                    :step="0.01"
                    v-model="current.settings.zoom"
                    :label="Math.round(current.settings.zoom * 100) + '%'"
                    @input="
                      document.querySelector('.page').style.zoom =
                        current.settings.zoom
                    "
                  ></v-slider>
                </v-card>
              </v-menu>

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2" style="margin-bottom: -2px"
                  >mdi-ruler</v-icon
                >Ruler</v-btn
              >

              <v-btn large text tile disabled
                ><v-icon class="mr-2 ml-n2" style="margin-bottom: -2px"
                  >mdi-image-filter-center-focus</v-icon
                >Focus</v-btn
              >
            </v-tab-item>

            <v-tab-item> Figure it out yourself </v-tab-item>
          </v-tabs-items>
        </v-toolbar>

        <div
          style="
            height: calc(100vh - 134px);
            overflow-y: auto;
            overflow-x: hidden;
          "
          class="d-print-none"
          @click="tiptap.commands.focus()"
        >
          <v-card
            ref="page"
            style="margin: auto; min-height: 1071px; cursor: text"
            class="my-3 page"
            width="828"
            light
            tile
          >
            <editor-content
              @update="change = true"
              style="
                overflow-y: auto;
                overflow-x: hidden;
                margin: auto;
                height: 100%;
              "
              class="pa-12"
              :editor="tiptap"
            />
          </v-card>
        </div>

        <div class="d-none d-print-block" v-html="tiptap.getHTML()"></div>

        <v-dialog
          @click:outside="link_dialog = { open: false, url: '' }"
          v-model="link_dialog.open"
          max-width="400"
          class="d-print-none"
        >
          <v-card>
            <v-btn
              @click="link_dialog = { open: false, url: '' }"
              fab
              text
              x-small
              absolute
              top
              right
              class="mt-8"
              color="grey"
              ><v-icon>mdi-close</v-icon></v-btn
            >

            <v-card-title class="font-weight-regular">Insert Link</v-card-title>

            <v-card-text>
              <v-text-field
                v-model="link_dialog.url"
                label="URL"
                hide-details
                @keyup.enter="
                  tiptap
                    .chain()
                    .focus()
                    .setLink({ href: link_dialog.url })
                    .run(),
                    (link_dialog = { open: false, url: '' })
                "
              ></v-text-field>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="!link_dialog.url"
                color="blue"
                text
                @click="
                  tiptap
                    .chain()
                    .focus()
                    .setLink({ href: link_dialog.url })
                    .run(),
                    (link_dialog = { open: false, url: '' })
                "
                >Insert</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog
          @click:outside="image_dialog = { open: false, file: null }"
          v-model="image_dialog.open"
          max-width="400"
          class="d-print-none"
        >
          <v-card>
            <v-btn
              @click="image_dialog = { open: false, file: null }"
              fab
              text
              x-small
              absolute
              top
              right
              class="mt-8"
              color="grey"
              ><v-icon>mdi-close</v-icon></v-btn
            >

            <v-card-title class="font-weight-regular"
              >Insert Image</v-card-title
            >

            <v-card-text>
              <v-file-input
                prepend-icon="mdi-image"
                label="Image"
                v-model="image_dialog.file"
              ></v-file-input>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                :disabled="!image_dialog.file"
                color="blue"
                text
                @click="insertImage()"
                >Insert</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </main>
    </v-main>
  </v-app>
</template>

<script>
import { remote } from "electron";
import { io } from "socket.io-client";
import { shell } from "electron";
import Store from "./store.js";
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Image } from "./extensions/image.js";
import { Color } from "./extensions/fontColor.js";
import { LineSpacing } from "./extensions/lineSpacing.js";
import { FontFamily } from "./extensions/fontFamily.js";
import fs from "fs";

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

    insert_image: false,
    insert_image_command: null,
    image_url: "",
    tiptap: new Editor({
      extensions: [
        StarterKit,
        TextStyle,
        FontFamily,
        Link,
        Underline,
        TextAlign,
        Typography,
        TaskList,
        TaskItem,
        Image,
        Color,
        LineSpacing,
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ],
    }),
    current: false,
    tab: 1,
    title: "New document.write",
    recent_files: [],
    isNew: false,
    recent_file_hover: -1,
    link_dialog: {
      open: false,
      url: "",
    },
    image_dialog: {
      open: false,
      file: null,
    },
    change: false,
    path: "",

    window,
    shell,
    document,
    Math,
  }),
  async created() {
    if (store.get("jwt")) {
      const jwt = store.get("jwt");
      this.$http
        .post("https://www.theparadigm.ga/api/authentication/verify", {
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
    this.recent_files = store.get("recent_files");

    this.tiptap.on("update", ({ editor }) => {
      this.change = true;
    });

    window.addEventListener("keydown", (e) => {
      if (process.platform == "darwin") {
        if (e.code == "KeyS" && e.metaKey && this.current) this.saveDocument();
        if (e.code == "KeyP" && e.metaKey && this.current) this.printDocument();
        if (e.code == "KeyN" && e.metaKey && this.current) {
          e.preventDefault();
          this.newDocument();
        }
      } else {
        if (e.code == "KeyS" && e.ctrlKey && this.current) this.saveDocument();
        if (e.code == "KeyP" && e.ctrlKey && this.current) this.printDocument();
        if (e.code == "KeyN" && e.ctrlKey && this.current) {
          e.preventDefault();
          this.newDocument();
        }
      }
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
        .post("https://www.theparadigm.ga/api/authentication/signin", {
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
          .post("https://www.theparadigm.ga/api/authentication/signout", {
            _id: this.$root.user._id,
          })
          .then((response) => {
            this.$root.socket.disconnect();
            this.$root.socket = io.connect("https://www.theparadigm.ga");
            store.set("jwt", false);
            this.$root.user = false;
          });
      }
    },

    newDocument() {
      this.current = {
        html: "",
        settings: {
          zoom: 1,
        },
      };
      this.tiptap.commands.setContent("");
      this.tiptap.commands.focus();
      this.isNew = true;
      this.change = false;
      this.title = "New document.write";
      if (this.tab == 0) this.tab = 1;
      setTimeout(() => {
        document.querySelector(".page").style.zoom = 1;
      }, 1);
    },
    saveDocument() {
      const html = this.tiptap.getHTML();
      if (!this.isNew) {
        fs.writeFileSync(
          this.path,
          JSON.stringify({
            html,
            title: this.path.substring(this.path.lastIndexOf("/") + 1),
            settings: this.current.settings,
          })
        );
      } else if (this.isNew) {
        remote.dialog
          .showSaveDialog({
            title: "Save file",
            defaultPath: this.title,
            filters: [
              {
                name: "Write files",
                extensions: ["write"],
              },
            ],
          })
          .then((result) => {
            fs.writeFileSync(
              result.filePath,
              JSON.stringify({
                html,
                title: result.filePath.substring(
                  result.filePath.lastIndexOf("/") + 1
                ),
                settings: this.current.settings,
              })
            );

            this.recent_files.splice(0, 0, {
              title: this.title,
              path: result.filePath,
            });
            store.set("recent_files", this.recent_files);
          });
      }
      this.change = false;
    },
    openOpenDialog() {
      remote.dialog
        .showOpenDialog({
          title: "Open file",
          filters: [
            {
              name: "Write files",
              extensions: ["write"],
            },
          ],
        })
        .then((result) => {
          this.openDocument(result.filePaths[0]);
        });
    },
    openDocument(path) {
      this.change = false;
      this.isNew = false;
      this.path = path;
      const file = JSON.parse(fs.readFileSync(path));
      const data = {
        title: file.title,
        path,
      };
      const index = this.recent_files.findIndex(
        (item) => item.title == data.title && item.path == data.path
      );
      if (index < 0) {
        this.recent_files.splice(0, 0, data);
      } else {
        this.recent_files.splice(index, 1);
        this.recent_files.splice(0, 0, data);
        store.set("recent_files", this.recent_files);
      }
      this.tiptap.commands.setContent(file.html);
      this.title = file.title;
      this.current = file;
      store.set("recent_files", this.recent_files);
      this.recent_file_hover = -1;
      if (this.tab == 0) this.tab = 1;
      setTimeout(() => {
        document.querySelector(".page").style.zoom = this.current.settings.zoom;
      }, 1);
    },
    closeDocument() {
      this.change = false;
      this.current = false;
    },
    printDocument() {
      remote.getCurrentWebContents().print();
    },
    insertImage() {
      const setImage = () => {
        this.tiptap.chain().focus().setImage({ src: reader.result }).run();
        this.image_dialog = {
          open: false,
          file: null,
        };
      };
      let reader = new FileReader();
      reader.onloadend = () => {
        setImage();
      };
      reader.readAsDataURL(this.image_dialog.file);
    },
    removeFromRecents(index) {
      this.recent_files.splice(index, 1);
      store.set("recent_files", this.recent_files);
    },
  },
  beforeDestroy() {
    this.tiptap.destroy();
  },
  components: {
    EditorContent,
  },
};
</script>

<style lang="scss">
// ul[data-type="taskList"] {
//   list-style: none;
//   padding: 0;

//   li {
//     display: flex;
//     align-items: center;

//     > label {
//       flex: 0 0 auto;
//       margin-right: 0.5rem;
//     }
//   }
// }

html,
body {
  overflow: hidden !important;
  background-color: #121212;
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

.ProseMirror {
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }
  }
  outline: none !important;
  height: 100%;
}

.tableWrapper {
  padding: 1rem 0;
  overflow-x: auto;
}

.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}

input,
textarea {
  outline: none;
  width: 100%;
}

span {
  font-family: inherit;
  // display: inline-block;
}
@media print {
  .v-main {
    padding: 0px !important;
  }

  div {
    color: black;
  }
}

.v-toolbar .v-btn {
  height: 48px !important;
}
</style>