# vue-grid-sf
A rather handy grid UI component for Vue.js. Define the columns, bind the data, handle the events and off you go. 

Column headings are sortable by default, triggering an event. 

An optional action column with dropdown menu can also be defined with actions that are either links to other pages or triggers for custom events. 

An optional checkbox column for multiple row selection and select all.

# Requirements

- Vue.js ^`2.0.0`
- momentjs ^`2.12.0`
- node-esapi ^`0.0.1`

## Optional

- bootstrap ^`3.3.0` 

If you want to use the action menu or expandable column functionality, these depend on Bootstrap js. 

The default styling of the grid is also based on Bootstrap, but you can override that with your own if desired.

# Installation
Assuming that you'll be using gulp or browserify to roll all your js into a single file:
 
```shell
$ npm install vue-grid-sf --save-dev
```

To make this work in my Laravel project, I needed to add the following to the devDependencies of that project:
``` 
"babel-preset-stage-2": "^6.1.18"
```

## Build Setup

``` bash
# install dependencies
npm install
```

A simple demo app is available at localhost:8080/demo
``` bash
# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# lint all *.js and *.vue files
npm run lint

# run unit tests
npm test
```

For more information see the [docs for vueify](https://github.com/vuejs/vueify).

# Upgrade from v0.0 to v1.0

`vue-grid-sf` has been upgraded to work with Vue 2.0. Vue 2.0 does not support two-way binding of properties. Instead any changes to bound properties are passed back via events. The following component properties are affected by this change:

 - data
 - sort-column
 - sort-dir
 - rows-selected (this property been deprecated as row selections are handled entirely via events)

# Usage

```javascript
let Vue = require('vue');
import VueGridSf from 'vue-grid-sf'
Vue.component('vue-grid-sf', VueGridSf)
```

## Simple Example

After installing the plugin you can use it like this:

```html
<vue-grid-sf
        v-on:sort-order-changed="handleSortOrderChanged"
        v-bind:columns="columns"
        v-bind:data="myData"
></vue-grid-sf>
```

```javascript
var vm = new Vue({
    el: 'body',
    
    created () {
        // If you're using AJAX, you probably want to fetch your data here
        this.fetchData()     
    },
    
    data: {
        columns: [ 
            {
                name: 'id', 
                displayName: '#',
                dataType: 'integer'    
            }, {
                name: 'first_name', 
                displayName: 'First Name',
                dataType: 'string'    
            }, {
                name: 'languages_spoken',
                displayName: 'Languages Spoken Fluently',
                dataType: 'choice',
                options: [
                    { key: 'en', value: 'English' },
                    { key: 'fr', value: 'French' },
                    { key: 'pt', value: 'Portuguese' },
                    { key: 'es', value: 'Spanish' }
                    // ...more languages
                ],
                maxItems: 10,
                hidden: true // Don't display in grid (might be used for filtering if vue-filter-control is used)
            }, {
                name: languages_spoken_display_name,
                displayName: 'Languages Spoken Fluently',
                dataType: 'string',
                notFilterable: true // Don't include in list of columns that can be used for filtering (if vue-filter-control is sharing the columns data)
            }
        ],
        myData: [],
        sortColumn: null,
        sortDir: null
    },
    
    methods: {
        fetchData() {
            // Your AJAX or other code to display the data based on the new sort order
            this.MyData = [] // data fetched via AJAX or otherwise imported/sorted
        },
        handleSortColumnChanged (e) {
            this.sortColumn = e.column;
            this.sortDir = e.dir;
            this.fetchData();
        },
    }
});
```

## Fully Featured Example

If you want to make use of all of the features of vue-grid-sf:

```html
<vue-grid-sf
        v-on:cell-clicked="handleCellClicked"
        v-on:row-clicked="handleRowClicked"
        v-on:row-selected="handleRowSelected"
        v-on:sort-order-changed="handleSortOrderChanged"
        v-on:my-custom-event="handleMyCustomEvent"
        v-bind:columns="columns"
        v-bind:data="myData"
        v-bind:sort-column="sortColumn"
        v-bind:sort-dir="sortDir"
        v-bind:actions="actions"
        actions-column-heading="Actions"
        show-action-menu=true
        show-checkbox-selection=true
></vue-grid-sf>
```

```javascript
var vm = new Vue({
    el: 'body',

    created () {
        // If you're using AJAX, you probably want to fetch your data here
        this.fetchData()     
    },
    
    data: {
        actions: [
            {
                class: 'link',
                displayText: 'URL test',
                url: '/things/{key}/edit', // for each row, {key} is replaced by the rowData for the urlKey column 
                urlKey: 'id'
            }, {
                class: 'divider'
            }, {
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
            }, {
                name: 'first_name', 
                displayName: 'First Name',
                dataType: 'string'    
            }, {
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
                hidden: true // Don't display in vue-grid-sf (column might be used by vue-filter-control for filtering)
            }, {
                name: languages_spoken_display_name,
                displayName: 'Languages Spoken Fluently',
                dataType: 'string',
                notFilterable: true // Don't include in list of columns that can be used for filtering (if vue-filter-control is sharing the columns data)
            }
        ],
        myData: [],  
        sortColumn: 'id', // How the initial data is sorted (can be left blank)
        sortDir: 'asc'
    },
    
    methods: {
        fetchData() {
            // Your AJAX or other code to display the data based on the new sort order
            // Set myData, which is bound to vue-grid-sf's data property with data fetched via AJAX or otherwise imported/sorted
            this.myData = [] 
        },
        
        handleCellClicked(e) { // Object e has rowData and column properties
            if (e.column.name === 'something-special') {
                // do something special
            } else {
                // do something else, perhaps with e.rowData
                
            }
        },

        handleMyCustomEvent(rowData) { 
            // rowData for the row that triggered the event
            alert('Event triggered for row with id #' + rowData.id)           
        },
        
        handleRowClicked(rowData) {
        
        },

        handleRowSelected(rows) {
        
        },
        
        handleSortColumnChanged (e) {
            this.sortColumn = e.column;
            this.sortDir = e.dir;
            this.fetchData();
        },

    }
});
```

# Props

## Required

- `columns`
- `data`

## Optional

- `column-key` - the name of the column that contains a unique key for the data. Used by row selection functionality. Defaults to `id`.
- `sort-column` - the column that the data is sorted by (**Note:** the grid does not do the sorting, you provide sorted data). Defaults to `''`.
- `sort-dir` - the direction that the data in sortColumn, either `'asc'` or `'desc'`. Defaults to `'asc'`.
- `table-class` - CSS class applied to table. Defaults to `'table table-striped table-responsive table-box table-hover'`.
- `sort-asc-class` - CSS class applied to ascending sort. Defaults to `'glyphicon glyphicon-triangle-top'`.
- `sort-desc-class` - CSS class applied to descending sort. Defaults to `'glyphicon glyphicon-triangle-bottom'`.
- `show-action-menu` - determines whether the action menu column should be shown. Defaults to `false`.
- `actions` - array of actions to be added to action menu for every row in the grid. Defaults to `null`.
- `actions-column-heading` - Column heading for the actions menu defaults to `''`
- `show-checkbox-selection` - determines whether a column should be shown that enables multiple selection of rows. Defaults to `false`.

## Columns definition

### Required

 - `name` - the attribute in the `data` property that contains the data to be displayed in the column
 - `displayName` - the column heading
 - `dataType` - the column's dataType - currently supports `string`, `number`, `date`, `datetime`, `choice` (`choice` is more relevant to `vue-filter-control`) and `html` (only use if you know your content is safe to display).

### Optional

 - `dataFormat` - see `dataFormat` below for more info.
 - `expandable` - see `expandable` below for more info. 
 - `expandableFrom` - see `expandable` below for more info.
 - `expandableText` - see `expandable` below for more info.
 - `hidden` - see `Using with vue-filter-control` for more info.
 - `notFilterable` - see `Using with vue-filter-control` for more info.

### dataFormat

- for string dataType, setting `dataFormat` to `paragraph` will HTML encode the text and convert newlines to line breaks.
- for date and datetime dataTypes, you can set `dataFormat` to a momentjs compatible format (otherwise date will default to `ll` and datetime will default to `lll`).

### expandable

If you have a column where the data will contain lots of text data, you may want to truncate what is displayed in the grid and provide a hoverable and clickable popover (using Bootstrap's popover) to display the full text.

To do this for the column:

* Set `dataFormat` to `paragraph`
* Set `expandable` to `true`
* Set `expandableFrom` to the number of characters that you want displayed in the grid.
* Set `expandableText` to provide a hoverable, clickable text to trigger the popover displaying the full text. Defaults to `'(...)'`.

You will also need to run this code every time that new data populates the grid:

``` javascript
this.$nextTick(function () {
  $('[data-toggle="popover"]').popover(
    {container: 'body', html: false, placement: 'auto bottom', trigger: 'hover click'}
  )
})
```

NOTE: the `html` option should be set to false unless you are absolutely sure that the popover content is safe from XSS.  

### Using with vue-filter-control

You can share a common `columns` definition between `vue-grid-sf` and `vue-filter-control` since many of the column configurations will be the same for the grid and the filter.  

However, there will be some filter columns that you wouldn't want to be shown in the grid. In these cases, set:

```
 hidden: true
```
 
and some columns you may want to be listed in the grid, but you wouldn't want them to be available for filtering. In these cases, set:
``` 
 notFilterable: true
``` 

## Special data fields

 - `actionMenu` - see `Actions` below
 - `rowClass`
 
## Actions

Adding an action menu to the grid is made possible via some action specific properties and also via `data` property:

Setting `show-action-menu` to true will display an action menu column on the left side of the grid.

Setting the `actions` property to an array of actions will fill the action menu with these actions for every row in the grid.
  
In addition to the `actions` property, an array of actions can be defined per row in the data property. So, if you're fetching your data via AJAX, your server-side code can define the appropriate actions based on user permissions or row-specific conditions by passing the actions in an array via the column name `actionMenu`. The same action definition format is used for both the `actions` property and the `actionMenu` column in the `data` property.
  
### Action definition format

```  
actions: [
    {
        class: 'link',
        displayText: 'URL test',
        url: '/things/{key}/edit', // for each row, {key} is replaced by the row data for the urlKey column 
        urlKey: 'id'
    }, {
        class: 'divider'
    }, {
        class: 'event',
        displayText: 'Event test',
        event: 'my-custom-event' 
        // Note: you need to add v-on:my-custom-event={yourHandler} to the <vue-grid-sf> component
        //  The event handler will be passed the rowData
    }
],
```

## Row Selection

Adding the ability to select multiple or all rows in the grid is as simple as setting `show-checkbox-selection` to true. 
 
Listen out for a `row-selected` event to do something with the selected rows, such as bulk actions.
 
# Events

 - `cell-clicked` - object passed has `rowData` and `column` properties
 - `row-clicked` - object passed is `rowData`
 - `sort-order-changed` - object passed has `column` (the column name) and `dir` (set to either `'asc'` or `'desc'`) properties.
 - `row-selected` - an array of rowData is passed for the selected rows.
 - custom events as defined in the `actions` property and/or within the `actionMenu` data field in the data provided to the `data` property. Passed rowData.

