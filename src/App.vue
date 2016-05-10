<template>
  <div id="app">
    <hello></hello>
    <div class="btn-group">
      <div class="btn-group">
        <button :disabled="noneSelected" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Bulk Action <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a href="#">Action</a></li>
          <li><a href="#">Another action</a></li>
          <li><a href="#">Something else here</a></li>
          <li role="separator" class="divider"></li>
          <li><a href="#">Separated link</a></li>
        </ul>
      </div>
    </div>
    <vue-grid-sf
      @sort-order-changed="fetchUsers"
      @action-menu-event="handleThisActionMenuEvent"
      :columns="columns"
      :data.sync="users"
      :sort-column.sync="sortColumn"
      :sort-dir.sync="sortDir"
      :rows-selected.sync="rowsSelected"
      show-action-menu=true
      show-checkbox-selection=true
      table-class="table table-striped table-responsive table-box table-hover"
    ></vue-grid-sf>
  </div>
</template>

<script>
/* global $ */
import Hello from './components/Hello.vue'
import VueGridSf from './components/VueGridSf.vue'

var moment = require('moment')

var sort_by = function (field, reverse, primer) {
  var key = primer ? function (x) {return primer(x[field])} : function (x) {return x[field]}
  reverse = !reverse ? 1 : -1

  return function (a, b) {
    a = key(a)
    b = key(b)
    return reverse * ((a > b) - (b > a))
  }
}

export default {
  components: {
    Hello,
    'vue-grid-sf': VueGridSf
  },
  data: function () {
    return {
      user: null,
      users: [
        {id: 1, email: 'fred@bloggs.com', first_name: 'Fred', last_name: 'Bloggs', role_id: 1,
          roleTitle: 'Admin', joined: '2015-08-21', last_login: '2016-05-09 12:31:53',
          notes: 'This text is longer than 20 characters, so will be truncated but expandable.',
          actionMenu: [
              {class: 'link', displayText: 'URL link', url: '/not-a-page/{key}', urlKey: 'id'},
              {class: 'event', displayText: 'Event', event: 'action-menu-event'}
          ]
        }, {
          id: 2, email: 'fredrika@bloggs.com', first_name: 'Fredrika', last_name: 'Bloggs',
          role_id: 2, roleTitle: 'Owner', joined: '2016-05-08', last_login: '2016-05-10 09:12:11',
          actionMenu: [
              {class: 'link', displayText: 'URL link', url: '/not-a-page/{key}', urlKey: 'id'},
              {class: 'event', displayText: 'Event', event: 'action-menu-event'}
          ]
        }, {
          id: 3, email: 'jeff@smith.com', first_name: 'Jeff', last_name: 'Smith', role_id: 3,
          roleTitle: 'Customer',
          actionMenu: [
              {class: 'link', displayText: 'URL link', url: '/not-a-page/{key}', urlKey: 'id'},
              {class: 'event', displayText: 'Event', event: 'action-menu-event'}
          ]
        }, {
          id: 4, email: 'jack@jones.com', first_name: 'Jack', last_name: 'Jones', role_id: 4,
          roleTitle: 'Supplier',
          actionMenu: [
              {class: 'link', displayText: 'URL link', url: '/not-a-page/{key}', urlKey: 'id'},
              {class: 'event', displayText: 'Event', event: 'action-menu-event'}
          ]
        }
      ],
      currentPage: 1,
      userFilters: [],
      pageCount: 1,
      rowsSelected: [],
      sortColumn: 'id',
      sortDir: 'asc',
      loading: false,
      showing: {
        start: null,
        end: null,
        total: null
      },
      xCols: []
    }
  },

  created () {
    this.$nextTick(function () {
      $('[data-toggle="popover"]').popover(
        {container: 'body', html: true, placement: 'auto bottom', trigger: 'hover click'}
      )
    })
  },

  computed: {
    columns () {
      return [
        {
          name: 'id',
          displayName: '#',
          dataType: 'number'
        }, {
          name: 'email',
          displayName: 'Email',
          dataType: 'string'
        }, {
          name: 'first_name',
          displayName: 'First Name',
          dataType: 'string'
        }, {
          name: 'last_name',
          displayName: 'Last Name',
          dataType: 'string'
        }, {
          name: 'role_id',
          displayName: 'Role',
          dataType: 'choice',
          options: [
              {key: 1, value: 'Admin'},
              {key: 2, value: 'Owner'},
              {key: 3, value: 'Quality Control'}
          ],
          hidden: true
        }, {
          name: 'roleTitle',
          displayName: 'Role',
          dataType: 'string',
          notFilterable: true
        }, {
          name: 'joined',
          displayName: 'Joined',
          dataType: 'date'
        }, {
          name: 'last_login',
          displayName: 'Last logged in',
          dataType: 'datetime'
        }, {
          name: 'notes',
          displayName: 'Notes',
          dataType: 'string',
          dataFormat: 'paragraph',
          expandable: true,
          expandableFrom: 20
        }
      ]
    },

    noneSelected () {
      return this.rowsSelected.length === 0
    }
  },

  methods: {
    fetchUsers () {
      switch (this.sortColumn) {
        case 'id':
        case 'role_id':
          this.users.sort(sort_by(this.sortColumn, (this.sortDir === 'desc'), parseInt))
          break
        case 'joined':
        case 'last_login':
          this.users.sort(sort_by(this.sortColumn, (this.sortDir === 'desc'), moment))
          break
        default:
          this.users.sort(sort_by(this.sortColumn, (this.sortDir === 'desc'), function (a) {return ('' + a).toUpperCase()}))
      }
    },
    handleThisActionMenuEvent (ev) {
      alert('User with email ' + ev.email + ' chosen')
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>
