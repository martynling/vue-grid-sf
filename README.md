# vue-simple-grid
A simple Vue.js grid component. Define the columns, bind the data and off you go. 

Column headings are sortable by default, triggering an event. An action column with dropdown menu can also be defined with
actions that are either links to other pages or triggers a custom event.

# Requirements

- Vue.js ^`1.0.16`

# Installation
Assuming that you'll be using gulp or browserify to roll all your js into a single file:
 
```shell
$ npm install vue-simple-grid --save-dev
```

# Usage

```javascript
var Vue = require('vue');
import VueSimpleGrid from 'vue-simple-grid'
Vue.component('vue-simple-grid', VueSimpleGrid)
```

After installing the plugin you can use it like this

```html
<vue-simple-grid
        @cell-clicked="cellClicked"
        @row-clicked="rowClicked"
        @sort-order-changed="fetchData"
        @my-custom-event="handleMyCustomEvent"
        :columns="columns"
        :data.sync="myData"
        :sort-column.sync="sortColumnName"
        :sort-dir.sync="sortDir"
        :actions="actions"
        actions-column-heading="Actions"
        show-action-menu=true
></vue-simple-grid>
```

```javascript
var vm = new Vue({
    el: 'body',
    data: {
        actions: [
            {
                class: 'link',
                displayText: 'URL test',
                url: '/things/{key}/edit', // for each row, {key} is replaced by the rowData for the urlKey column 
                urlKey: 'id'
            },{
                class: 'divider'
            },{
                class: 'event',
                displayText: 'Event test',
                event: 'my-custom-event'
            }
        ],
        columns: [ 
            {
                name: 'id', 
                displayName: '#',
                dataType: 'integer'    
            },{
                name: 'first_name', 
                displayName: 'First Name',
                dataType: 'string'    
            },{
                name: 'languages_spoken',
                displayName: 'Languages Spoken Fluently',
                dataType: 'multi-select',
                options: [
                    { key: 'en', value: 'English' },
                    { key: 'fr', value: 'French' },
                    { key: 'pt', value: 'Portuguese' },
                    { key: 'es', value: 'Spanish' }
                    // ...more languages
                ],
                maxItems: 10,
                hidden: true // Don't display in table (might be used for filtering)
            },{
                name: languages_spoken_display_name,
                displayName: 'Languages Spoken Fluently',
                dataType: 'string',
                notFilterable: true // Don't include in list of columns that can be used for filtering (if vue-filter-control is sharing the columns data)
            }
        ],
        myData: [], // You should initialize this data however you want 
        sortColumnName: 'id', // How the initial data is sorted (can be left blank)
        sortDir: 'asc'
    },
    
    methods: {
        cellClicked(e) { // Object e has rowData and column properties
            if (e.column.name == 'something-special') {
                // do something special
            } else {
                // do something else
            }
        },

        fetchData() {
            // Your AJAX or other code to display the data based on the new sort order
        },
        
        handleMyCustomEvent() {
            // Do something
        },
        
        rowClicked(rowData) {
        
        },
    }
});
```

## Props

- `columns`
- `data`
- `sortColumn`
- `sortDir`
- `tableClass` - defaults to 'table table-striped table-responsive table-hover'
- `sortAscClass` - defaults to 'glyphicon glyphicon-triangle-top'
- `sortDescClass` - defaults to 'glyphicon glyphicon-triangle-bottom'
- `actions` - array of actions
- `actionsColumnHeading`

## Events

 - `cell-clicked`
 - `row-clicked`
 - `sort-order-changed`

# Using with vue-filter-control

You can share a common column definition:

# Special data fields

 - `actionMenu`
 - `rowClass`
 
# dataFormat
 - for string dataType, `paragraph` will HTML encode the text and convert newlines to line breaks.
 - for date and datetime dataTypes, you can add a momentjs compatible format (otherwise date will default to `ll` and datetime will default to `lll`).
