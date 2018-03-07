<template>
  <div class="vue-grid-sf">
    <table v-bind:class="tableClass">
      <tbody>
      <tr>
        <th v-if="showCheckboxSelection">
         <input type="checkbox"
                v-on:change="toggleAll"
                v-model="allSelected"
         >
        </th>
        <th v-if="showActionMenu">
         {{ actionsColumnHeading }}
        </th>
        <th v-for="column in visibleColumns"
            v-bind:key="column.name"
            v-on:click="sortBy(column)"
            v-bind:class="columnClass(column)"
            aria-label="sort"
        >
         {{ column.displayName }} <span v-if="isSorting(column)" v-bind:class="sortingClass(column)"></span>
        </th>
      </tr>
      <tr v-for="rowData in processedData"
          v-bind:key="rowData[this.sortColumn]"
          v-bind:class="getRowClass(rowData)"
          v-on:click="rowClicked(rowData)"
      >
        <td v-if="showCheckboxSelection">
          <input type="checkbox"
                v-on:change="rowSelected(rowData)"
                v-bind:value="rowData[this.columnKey]"
                v-model="rowData.vgsfSelected"
          >
        </td>
        <td v-if="showActionMenu"  class="dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
             <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
          </a>
          <ul class="action-menu dropdown-menu" role="menu">
            <li v-for="action in rowActions(rowData)"
                v-bind:key="action.displayText"
                v-bind:class="action.class"
            >
              <a v-if="action.class == 'link'"
                 v-bind:href="getActionUrl(action, rowData)"
              >
               {{ action.displayText }}
              </a>
              <a v-if="action.class == 'event'"
                 v-on:click="actionClicked(action, rowData)"
              >
               {{ action.displayText }}
              </a>
            </li>
          </ul>
        </td>
        <td v-for="column in visibleColumns"
            v-bind:key="column.name"
            v-on:click="cellClicked(rowData, column)"
        >
          <span v-if="alreadyEscaped(column)" v-html="formatData(rowData, column)"> </span>
          <span v-if="!alreadyEscaped(column)">{{ formatData(rowData, column) }}</span>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script type="text/babel">
  const nl2br = function (text) {
    return text.replace(/(?:\r\n|\r|\n|&#xd;&#xa;|&#xd;|&#xa;)/g, '<br>')
  }

  const htmlEncode = function (html) {
    let txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  const moment = require('moment')
  const momentize = function (date, outputFormat) {
    if (moment(date, 'YYYY-MM-DD HH:mm:ss').isValid()) {
      return moment(date, 'YYYY-MM-DD HH:mm:ss').format(outputFormat)
    }
    return ''
  }

  const ESAPI = require('node-esapi')

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
      },
      sortColumn: {
        default: ''
      },
      sortDir: {
        default: 'asc'
      },
      tableClass: {
        default: 'table table-striped table-responsive table-box table-hover'
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
      }
    },

    data: function () {
      return {
        allSelected: false
      }
    },

    computed: {
      // Add in an extra data attribute to enable management of row selections.
      // Using `vgsfSelected` property name to ensure a name clash with a real data attribute unlikely.
      processedData () {
        let processedData = this.data;
        processedData.forEach(function(obj) { obj.vgsfSelected = false; });
        return processedData;
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
          this.$emit(action.event, rowData)
        }
      },

      actionsDefault () {
        return []
      },

      alreadyEscaped (column) {
        return column.dataFormat === 'paragraph'
      },

      cellClicked (rowData, column) {
        this.$emit('cell-clicked', {
          rowData: rowData,
          column: column
        })
      },

      columnClass (column) {
        return column.notSortable ? '' : 'clickable'
      },

      formatData (rowData, column) {
        let rawValue = rowData[column.name]
        let newValue = rawValue
        let expanding = false
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
            if (newValue && column.dataFormat === 'paragraph') {
              if (column.expandable) {
                if (newValue.length > column.expandableFrom) {
                  newValue = newValue.substring(0, column.expandableFrom - 1)
                  expanding = true
                }
              }
              newValue = nl2br(ESAPI.encoder().encodeForHTML(newValue))
              let popoverContent = ESAPI.encoder().encodeForHTML((rawValue))
              if (expanding) {
                newValue += ' <a data-toggle="popover" data-content="' + popoverContent + '">' + this.getExpander(column) + '</a>'
              }
            }
            return newValue
          case 'html':
            if (newValue && column.dataFormat === 'paragraph') {
              if (column.expandable) {
                if (newValue.length > column.expandableFrom) {
                  newValue = newValue.substring(0, column.expandableFrom - 1)
                  expanding = true
                }
              }
              if (expanding) {
                newValue += ' <a data-toggle="popover" data-content="' + rawValue + '">' + this.getExpander(column) + '</a>'
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
        let fixed = this.actions ? this.action : []
        let rowSpecific = rowData.actionMenu ? rowData.actionMenu : []
        return fixed.concat(rowSpecific)
      },

      rowClicked (rowData) {
        this.$emit('row-clicked', rowData)
      },

      rowSelected (rowData) {
        let selectedRows = this.processedData.filter( function (rowData) {
          return rowData.vgsfSelected;
        })
        this.allSelected = (selectedRows.length === this.data.length);
        this.$emit('row-selected', selectedRows)
      },

      sortBy (column) {
        if (column.notSortable) return false
        let newCol = column.name
        let newDir = null

        if (column.name === this.sortColumn) {
          newDir = this.sortDir === 'asc' ? 'desc' : 'asc'
        } else {
          newDir = 'asc'
        }
        this.$emit('sort-order-changed', {
          'column': newCol,
          'dir': newDir
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
        this.processedData.forEach(function (obj) {
          obj.vgsfSelected = this.allSelected
        }, this)
        let selectedRows = this.processedData.filter( function (rowData) {
          return rowData.vgsfSelected;
        })
        this.$emit('row-selected', selectedRows)
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

  /* Add external table borders */
  .table-box {
    border-collapse: separate;
    border: 1px solid #b7c7cf;
  }

  .table-box thead > tr > th {
    border-bottom: 1px solid #d8e6ec;
  }

  .popover {
    white-space: pre-line;
  }
</style>