<template>
   <div class="vue-simple-grid">
       <table class="{{ tableClass }}">
           <tr>
               <th v-if="showActionMenu">
                   {{ actionsColumnHeading }}
               </th>
               <th v-for="column in visibleColumns" @click="sortBy(column)" :class="columnClass(column)" aria-label="sort">
                   {{ column.displayName }} <span v-if="isSorting(column)" :class="sortingClass(column)"></span>
               </th>
           </tr>
           <tr v-for="rowData in data" :class="getRowClass(rowData)"  @click="rowClicked(rowData)">
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
                   <span v-if="alreadyEscaped(column)">
                       <span v-show="expanded[rowData.id] && expanded[rowData.id][column.name]">{{{ formatData(rowData, column, true) }}}</span>
                       <span v-show="!expanded[rowData.id] || expanded[rowData.id][column.name]">{{{ formatData(rowData, column) }}}</span>
                   </span>
                   <span v-if="!alreadyEscaped(column)">{{ formatData(rowData, column) }}</span>
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
            },
            showActionMenu: {
                default: false
            }
        },

        data: function () {
            return {
                expanded: {}
            };
        },

        computed: {
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
                this.expanded[rowData.id][column.name] = !this.expanded[rowData.id][column.name]
                this.$dispatch('cell-clicked', {
                    rowData: rowData,
                    column: column
                })
            },

            columnClass(column) {
                return column.notSortable ? '' : 'clickable'
            },

            formatData(rowData, column, expanded = false) {
                var rawValue = rowData[column.name]
                switch (column.dataType) {
                    case 'date':
                        if (column.dataFormat)
                            return Vue.filter('momentize')(rawValue, column.dataFormat)
                        else
                            return Vue.filter('momentize')(rawValue, 'll')
                    case 'datetime':
                        if (column.dataFormat)
                            return Vue.filter('momentize')(rawValue, column.dataFormat)
                        else
                            return Vue.filter('momentize')(rawValue, 'lll')
                    case 'string':
                        var newValue = rawValue
                        if (column.dataFormat == 'paragraph') {
                            if (column.expandable && !expanded){
                                if (newValue.length > column.expandableFrom){
                                    newValue = newValue.substring(0, column.expandableFrom)
                                    if (typeof this.expanded[rowData.id] === 'undefined')
                                        this.expanded[rowData.id] = {}
                                    if (typeof this.expanded[rowData.id][column.name] === 'undefined')
                                        this.expanded[rowData.id][column.name] = false
                                    var expanding = true
                                }
                            }
                            newValue = Vue.filter('nl2br')(Vue.filter('htmlEncode')(newValue))
                            var popoverContent = Vue.filter('nl2br')(Vue.filter('htmlEncode')(rawValue))
                            if (expanding)
                                newValue += ' <a data-toggle="popover" data-content="'+ popoverContent +'">' + column.expandableText + '</a>'
                        }
                        return newValue
                }
                return rawValue
            },

            getActionUrl(action, rowData) {
                if (action.url)
                    if (action.urlKey){
                        return action.url.replace("{key}", rowData[action.urlKey])
                    } else {
                        return action.url
                    }
                else
                    return '#'
            },

            getRowClass(rowData) {
                return 'clickable' + (rowData.rowClass ? ' ' + rowData.rowClass : '')
            },

            isSorting(column) {
                return column.name == this.sortColumn
            },

            rowActions(rowData) {
                var fixed = this.actions ? this.action : []
                var rowSpecific = rowData.actionMenu ? rowData.actionMenu : []
                return fixed.concat(rowSpecific)
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