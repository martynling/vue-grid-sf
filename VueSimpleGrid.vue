<template>
   <div class="vue-simple-grid">
       <table class="{{ tableClass }}">
           <tr>
               <th v-for="column in visibleColumns" @click="sortBy(column)" :class="columnClass(column)" aria-label="sort">
                   {{ column.displayName }} <span v-if="isSorting(column)" :class="sortingClass(column)"></span>
               </th>
               <th v-if="hasActions">
                   {{ actionsColumnHeading }}
               </th>
           </tr>
           <tr v-for="rowData in data" :class="getRowClass(rowData)"  @click="rowClicked(rowData)">
               <td v-for="column in visibleColumns" @click="cellClicked(rowData, column)">
                   <span v-if=""></span>
                   <span v-if="alreadyEscaped(column)">{{{ formatData(rowData[column.name], column) }}}</span>
                   <span v-if="!alreadyEscaped(column)">{{ formatData(rowData[column.name], column) }}</span>
               </td>
               <td v-if="hasActions"  class="dropdown">
                   <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                       <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
                   </a>
                   <ul class="action-menu dropdown-menu pull-right" role="menu">
                       <li v-for="action in actions">
                           <a :href="getActionUrl(action, rowData)" @click="actionClicked(action, rowData)">
                           {{ action.displayText }}</a>
                       </li>
                   </ul>
               </td>
           </tr>
       </table>
   </div>
</template>

<script type="text/babel">
    export default {
        props: {
            columns: {
                required: true,
            },
            data: {
                required: true,
                twoWay:true
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
            }
        },

        data: function () {
            return {};
        },

        computed: {
            hasActions() {
                return this.actions && this.actions.length > 0
            },

            visibleColumns() {
                return this.columns.filter(function(column) {
                    return !column.hidden;
                });
            }
        },

        methods: {
            actionClicked(action, rowData) {
                if (action.event) {
                    this.$dispatch(action.event, rowData)
                }
            },

            actionsDefault() {
                return []
            },

            alreadyEscaped(column) {
                return column.dataFormat == 'paragraph'
            },

            cellClicked(rowData, column) {
                this.$dispatch('cell-clicked', {
                    rowData: rowData,
                    column: column
                })
            },

            columnClass(column) {
                return column.notSortable ? '' : 'clickable'
            },

            formatData(rawValue, column) {
                switch (column.dataType) {
                    case 'date':
                        if (moment(rawValue, "YYYY-MM-DD HH:mm:ss").isValid()) {
                            return moment(rawValue, "YYYY-MM-DD HH:mm:ss").format('ll')
                        }
                        return ''
                    case 'datetime':
                        return Vue.filter('momentize')(rawValue, 'lll')
                    case 'string':
                        if (column.dataFormat == 'paragraph')
                            return Vue.filter('nl2br')(Vue.filter('htmlEncode')(rawValue))
                        break
                }
                return rawValue
            },

            getActionUrl(action, rowData) {
                if (action.url)
                    return action.url.replace("{key}", rowData[action.urlKey])
                else
                    return '#'
            },

            getRowClass(item) {
                return 'clickable' // other classes might be apply by passing via props in future
            },

            isSorting(column) {
                return column.name == this.sortColumn
            },

            rowClicked(rowData) {
                this.$dispatch('row-clicked', rowData)
            },

            sortBy(column) {
                if (column.notSortable)
                        return false

                if (column.name == this.sortColumn) {
                    this.sortDir = this.sortDir == 'asc' ? 'desc' : 'asc'
                } else {
                    this.sortColumn = column.name
                    this.sortDir = 'asc'
                }
                this.$dispatch('sort-order-changed', {
                    'column': this.sortColumn,
                    'dir': this.sortDir
                })
            },

            sortingClass(column) {
                if (column.name == this.sortColumn) {
                    if (this.sortDir == 'asc') {
                        return 'col-sort asc ' + this.sortAscClass
                    } else {
                        return 'col-sort desc ' + this.sortDescClass
                    }
                }
                return ''
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
</style>