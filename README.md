# vue-grid-sf
A rather handy grid UI component for Vue.js. Define the columns, bind the data and off you go. 

Column headings are sortable by default, triggering an event. 

An optional action column with dropdown menu can also be defined with actions that are either links to other pages or triggers for custom events. 

An optional checkbox column for multiple row selection and select all.

# Requirements

- Vue.js ^`1.0.0`
- momentjs ^`2.12.0`

## Optional

- bootstrap ^`3.3.0` 

If you want to use the action menu or expandable column functionality, these depend on Bootstrap js. 

The default styling of the grid is also based on Bootstrap, but you can override that with your own if desired.

# Installation
Assuming that you'll be using gulp or browserify to roll all your js into a single file:
 
```shell
$ npm install vue-grid-sf --save-dev
```

## Build Setup

``` bash
# install dependencies
npm install

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

# Usage

```javascript
var Vue = require('vue');
import VueGridSf from 'vue-grid-sf'
Vue.component('vue-grid-sf', VueGridSf)
```

## Simple Example

After installing the plugin you can use it like this:

```html
<vue-grid-sf
        @sort-order-changed="fetchData"
        :columns="columns"
        :data.sync="myData"
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
        myData: [] 
    },
    
    methods: {
        fetchData() {
            // Your AJAX or other code to display the data based on the new sort order
            this.MyData = [] // data fetched via AJAX or otherwise imported/sorted
        }
    }
});
```

## Fully Featured Example

If you want to make use of all of the features of vue-grid-sf:

```html
<vue-grid-sf
        @cell-clicked="cellClicked"
        @row-clicked="rowClicked"
        @sort-order-changed="fetchData"
        @my-custom-event="handleMyCustomEvent"
        :columns="columns"
        :data.sync="myData"
        :sort-column.sync="sortColumnName"
        :sort-dir.sync="sortDir"
        :rows-selected.sync="rowsSelected"        
        :actions="actions"
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
                hidden: true // Don't display in table (might be used for filtering)
            }, {
                name: languages_spoken_display_name,
                displayName: 'Languages Spoken Fluently',
                dataType: 'string',
                notFilterable: true // Don't include in list of columns that can be used for filtering (if vue-filter-control is sharing the columns data)
            }
        ],
        myData: [],  
        rowsSelected: [],
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
            // Set myData, which is bound to vue-grid-sf's data property with data fetched via AJAX or otherwise imported/sorted
            this.myData = [] 
        },
        
        handleMyCustomEvent(e) { 
            // Object e has a property named rowData, which is the data for the row that triggered the event
            alert('Event triggered for row with id #' + e.rowData.id)           
        },
        
        rowClicked(rowData) {
        
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
- `sort-column` - the column that the data is sorted by (not the grid does not do the sorting, you provide sorted data). Defaults to `''`.
- `sort-dir` - the direction that the data in sortColumn, either `'asc'` or `'desc'`. Defaults to `'asc'`.
- `table-class` - CSS class applied to table. Defaults to `'table table-striped table-responsive table-box table-hover'`.
- `sort-asc-class` - CSS class applied to ascending sort. Defaults to `'glyphicon glyphicon-triangle-top'`.
- `sort-desc-class` - CSS class applied to descending sort. Defaults to `'glyphicon glyphicon-triangle-bottom'`.
- `show-action-menu` - determines whether the action menu column should be shown. Defaults to `false`.
- `actions` - array of actions to be added to action menu for every row in the grid. Defaults to `null`.
- `actions-column-heading` - Column heading for the actions menu defaults to `''`
- `show-checkbox-selection` - determines whether a column should be shown that enables multiple selection of rows. Defaults to `false`.
- `rows-selected` - an array of `column-key` values identifying the selected rows in the grid. Defaults to `[]`.

## Columns definition

### Required

 - `name` - the attribute in the `data` property that contains the data to be displayed in the column
 - `displayName` - the column heading
 - `dataType` - the column's dataType - currently supports `string`, `number`, `date`, `datetime` and `choice` (`choice` is more relevant to `vue-filter-control`)

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

You will also need to run this code every time that new data populates the grid (not if the current data is only re-sorted though):

``` javascript
this.$nextTick(function () {
  $('[data-toggle="popover"]').popover(
    {container: 'body', html: true, placement: 'auto bottom', trigger: 'hover click'}
  )
})
```

### Using with vue-filter-control

You can share a common `columns` definition between `vue-grid-sf` and `vue-filter-control` since many of the column configurations will be the same for the grid and the filter.  

However, there will be some filter columns that you would want to be shown in the grid. In these cases, set:

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
    }
],
```

## Row Selection

Adding the ability to select multiple or all rows in the grid is as simple as setting `show-checkbox-selection` to true and binding an array to the `rows-selected` property. 
 
You can even, or alternatively, listen out for a `row-selected` event if you want.
 
# Events

 - `cell-clicked` - object passed has `rowData` and `column` properties
 - `row-clicked` - object passed is `rowData`
 - `sort-order-changed` - object passed has `column` (the column name) and `dir` (set to either `'asc'` or `'desc'`) properties.
 - `row-selected` - object passed is an array of unique keys (defined by `column-key` property) for the rows selected in the grid.
 - custom events as defined in the `actions` property and/or within the `actionMenu` data field in the data provided to the `data` property. Object passed has the event name (defined as `event` in the action definition) and rowData properties.

