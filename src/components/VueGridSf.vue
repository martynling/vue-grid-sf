<template>
  <div class="vue-grid-sf">
    <table class="{{ tableClass }}">
      <tr>
        <th v-if="showCheckboxSelection">
         <input type="checkbox" @change="toggleAll" v-model="allSelected" :class="allSelectedClass">
        </th>
        <th v-if="showActionMenu">
         {{ actionsColumnHeading }}
        </th>
        <th v-for="column in visibleColumns" @click="sortBy(column)" :class="columnClass(column)" aria-label="sort">
         {{ column.displayName }} <span v-if="isSorting(column)" :class="sortingClass(column)"></span>
        </th>
      </tr>
      <tr v-for="rowData in data" :class="getRowClass(rowData)"  @click="rowClicked(rowData)">
        <td v-if="showCheckboxSelection">
         <input type="checkbox" @change="rowSelected(rowData)" :value="rowData[this.columnKey]" v-model="rowsSelected">
        </td>
        <td v-if="showActionMenu"  class="dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
             <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
          </a>
          <ul class="action-menu dropdown-menu" role="menu">
            <li v-for="action in rowActions(rowData)" :class="action.class">
              <a v-if="action.class == 'link'" :href="getActionUrl(action, rowData)">
               {{ action.displayText }}</a>
              <a v-if="action.class == 'event'"  @click="actionClicked(action, rowData)">
               {{ action.displayText }}</a>
            </li>
          </ul>
        </td>
        <td v-for="column in visibleColumns" @click="cellClicked(rowData, column)">
          <span v-if="alreadyEscaped(column)">{{{ formatData(rowData, column) }}}</span>
          <span v-if="!alreadyEscaped(column)">{{ formatData(rowData, column) }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script type="text/babel">
  var nl2br = function (text) {
    return text.replace(/(?:\r\n|\r|\n)/g, '<br>')
  }

  var htmlEncode = function (html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  var moment = require('moment')
  var momentize = function (date, outputFormat) {
    if (moment(date, 'YYYY-MM-DD HH:mm:ss').isValid()) {
      return moment(date, 'YYYY-MM-DD HH:mm:ss').format(outputFormat)
    }
    return ''
  }

  export default {
    props: {
      columns: {
        required: true
      },
      columnKey: {
        default: 'id'
      },
      data: {
        required: true,
        twoWay: true
      },
      sortColumn: {
        twoWay: true,
        default: ''
      },
      sortDir: {
        twoWay: true,
        default: 'asc'
      },
      tableClass: {
        default: 'table table-striped table-responsive table-hover'
      },
      sortAscClass: {
        default: 'glyphicon glyphicon-triangle-top'
      },
      sortDescClass: {
        default: 'glyphicon glyphicon-triangle-bottom'
      },
      actionsColumnHeading: {
        default: ''
      },
      actions: {
        default: null
      },
      showActionMenu: {
        default: false
      },
      showCheckboxSelection: {
        default: false
      },
      rowsSelected: {
        default: []
      }
    },

    data: function () {
      return {
        allSelected: false,
        allSelectedAmended: false
      }
    },

    computed: {
      allSelectedClass () {
        return this.allSelectedAmended ? 'select-all-amended' : ''
      },

      visibleColumns () {
        return this.columns.filter(function (column) {
          return !column.hidden
        })
      }
    },

    methods: {
      actionClicked (action, rowData) {
        if (action.event) {
          this.$dispatch(action.event, rowData)
        }
      },

      actionsDefault () {
        return []
      },

      alreadyEscaped (column) {
        return column.dataFormat === 'paragraph'
      },

      cellClicked (rowData, column) {
        this.$dispatch('cell-clicked', {
          rowData: rowData,
          column: column
        })
      },

      columnClass (column) {
        return column.notSortable ? '' : 'clickable'
      },

      formatData (rowData, column) {
        var rawValue = rowData[column.name]
        switch (column.dataType) {
          case 'date':
            if (column.dataFormat) return momentize(rawValue, column.dataFormat)
            else return momentize(rawValue, 'll')
            break
          case 'datetime':
            if (column.dataFormat) return momentize(rawValue, column.dataFormat)
            else return momentize(rawValue, 'lll')
            break
          case 'string':
            var newValue = rawValue
            if (newValue && column.dataFormat === 'paragraph') {
              if (column.expandable) {
                if (newValue.length > column.expandableFrom) {
                  newValue = newValue.substring(0, column.expandableFrom)
                  var expanding = true
                }
              }
              newValue = nl2br(htmlEncode(newValue))
              var popoverContent = nl2br(htmlEncode(rawValue))
              if (expanding) {
                newValue += ' <a data-toggle="popover" data-content="' + popoverContent + '">' + this.getExpander(column) + '</a>'
              }
            }
            return newValue
        }
        return rawValue
      },

      getActionUrl (action, rowData) {
        if (action.url) {
          if (action.urlKey) {
            return action.url.replace('{key}', rowData[action.urlKey])
          } else {
            return action.url
          }
        } else return '#'
      },

      getExpander (column) {
        return column.expandableText ? column.expandableText : '(...)'
      },

      getRowClass (rowData) {
        return 'clickable' + (rowData.rowClass ? ' ' + rowData.rowClass : '')
      },

      isSorting (column) {
        return column.name === this.sortColumn
      },

      rowActions (rowData) {
        var fixed = this.actions ? this.action : []
        var rowSpecific = rowData.actionMenu ? rowData.actionMenu : []
        return fixed.concat(rowSpecific)
      },

      rowClicked (rowData) {
        this.$dispatch('row-clicked', rowData)
      },

      rowSelected (rowData) {
        if (this.rowsSelected.length === 0) {
          this.allSelectedAmended = false
          this.allSelected = false
        } else if (this.rowsSelected.length === this.data.length) {
          this.allSelectedAmended = false
        } else {
          this.allSelectedAmended = true
          this.allSelected = true
        }
        this.$dispatch('row-selected', this.rowsSelected)
      },

      sortBy (column) {
        if (column.notSortable) return false

        if (column.name === this.sortColumn) {
          this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
        } else {
          this.sortColumn = column.name
          this.sortDir = 'asc'
        }
        this.$dispatch('sort-order-changed', {
          'column': this.sortColumn,
          'dir': this.sortDir
        })
      },

      sortingClass (column) {
        if (column.name === this.sortColumn) {
          if (this.sortDir === 'asc') {
            return 'col-sort asc ' + this.sortAscClass
          } else {
            return 'col-sort desc ' + this.sortDescClass
          }
        }
        return ''
      },

      toggleAll () {
        this.rowsSelected = []
        if (this.allSelected) {
          this.data.forEach(function (el, i, ar) {
            this.rowsSelected.push(el[this.columnKey])
          }, this)
        }
        this.allSelectedAmended = false
        this.$dispatch('row-selected', this.rowsSelected)
      }
    }

  }
</script>

<style>
  .clickable {
    cursor: pointer;
  }

  .col-sort {
    font-size: 10px;
  }

  .col-sort.asc {
    top: -2px;
  }

  .col-sort.desc {
    top: 2px;
  }

  .action-menu.dropdown-menu {
    top: 28px;
  }

  input.select-all-amended {
    opacity: 0.5;
  }
</style>