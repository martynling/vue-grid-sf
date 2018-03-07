/* global describe, it, expect */

import Vue from 'vue'
import Hello from '../../src/components/Hello.vue'

describe('Hello.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      components: { Hello },
      template: '<div><hello></hello></div>'
    }).$mount()
    expect(vm.$el.querySelector('.hello h1').textContent).toBe('Hello World!')
  })
})

// also see example testing a component with mocks at
// https://github.com/vuejs/vueify-example/blob/master/test/unit/a.spec.js#L22-L43
