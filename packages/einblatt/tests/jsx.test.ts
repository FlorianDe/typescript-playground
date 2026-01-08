/**
 * JSX Runtime Tests
 */

import { describe, it, expect } from 'vitest';
import { jsx, jsxs, Fragment } from '../src/jsx/jsx-runtime';
import { signal } from '../src/signals';

describe('JSX', () => {
  it('should create element', () => {
    const element = jsx('div', { id: 'test' });
    expect(element.tagName).toBe('DIV');
    expect(element.id).toBe('test');
  });

  it('should apply className', () => {
    const element = jsx('div', { className: 'test-class' });
    expect(element.className).toBe('test-class');
  });

  it('should apply class prop', () => {
    const element = jsx('div', { class: 'test-class' });
    expect(element.className).toBe('test-class');
  });

  it('should apply inline styles object', () => {
    const element = jsx('div', {
      style: { color: 'red', fontSize: '16px' },
    }) as HTMLElement;

    expect(element.style.color).toBe('red');
    expect(element.style.fontSize).toBe('16px');
  });

  it('should apply inline style string', () => {
    const element = jsx('div', {
      style: 'color: blue; font-size: 14px',
    }) as HTMLElement;

    expect(element.getAttribute('style')).toBe('color: blue; font-size: 14px');
  });

  it('should append text children', () => {
    const element = jsx('div', { children: 'Hello World' });
    expect(element.textContent).toBe('Hello World');
  });

  it('should append number children', () => {
    const element = jsx('div', { children: 42 });
    expect(element.textContent).toBe('42');
  });

  it('should append element children', () => {
    const child = jsx('span', { children: 'Child' });
    const parent = jsx('div', { children: child });

    expect(parent.children.length).toBe(1);
    expect(parent.children[0]?.tagName).toBe('SPAN');
    expect(parent.textContent).toBe('Child');
  });

  it('should append multiple children', () => {
    const element = jsx('div', {
      children: [
        jsx('span', { children: 'First' }),
        jsx('span', { children: 'Second' }),
      ],
    });

    expect(element.children.length).toBe(2);
    expect(element.children[0]?.textContent).toBe('First');
    expect(element.children[1]?.textContent).toBe('Second');
  });

  it('should skip null and undefined children', () => {
    const element = jsx('div', {
      children: [null, 'Text', undefined, jsx('span', { children: 'Child' })],
    });

    expect(element.childNodes.length).toBe(2); // Text + span
    expect(element.textContent).toContain('Text');
    expect(element.textContent).toContain('Child');
  });

  it('should skip boolean children', () => {
    const element = jsx('div', {
      children: [true, 'Text', false],
    });

    expect(element.textContent).toBe('Text');
  });

  it('should bind signal children reactively', () => {
    const count = signal(0);
    const element = jsx('div', { children: count });

    expect(element.textContent).toBe('0');

    count.value = 5;
    expect(element.textContent).toBe('5');

    count.value = 10;
    expect(element.textContent).toBe('10');
  });

  it('should handle event listeners', () => {
    let clicked = false;
    const element = jsx('button', {
      onClick: () => {
        clicked = true;
      },
    });

    element.click();
    expect(clicked).toBe(true);
  });

  it('should call component functions', () => {
    const MyComponent = ({ name }: { name: string }) => {
      return jsx('div', { children: `Hello ${name}` });
    };

    const element = jsx(MyComponent, { name: 'World' });
    expect(element.textContent).toBe('Hello World');
  });

  it('should handle htmlFor prop', () => {
    const element = jsx('label', { htmlFor: 'input-id' }) as HTMLElement;
    expect(element.getAttribute('for')).toBe('input-id');
  });

  it('should handle boolean attributes', () => {
    const element = jsx('button', { disabled: true }) as HTMLElement;
    expect(element.hasAttribute('disabled')).toBe(true);
  });

  it('should not set false boolean attributes', () => {
    const element = jsx('button', { disabled: false }) as HTMLElement;
    expect(element.hasAttribute('disabled')).toBe(false);
  });
});

describe('Fragment', () => {
  it('should create document fragment', () => {
    const fragment = Fragment({
      children: [
        jsx('div', { children: 'First' }),
        jsx('div', { children: 'Second' }),
      ],
    });

    expect(fragment).toBeInstanceOf(DocumentFragment);
    expect(fragment.childNodes.length).toBe(2);
  });

  it('should work with single child', () => {
    const fragment = Fragment({
      children: jsx('div', { children: 'Only child' }),
    });

    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.textContent).toBe('Only child');
  });
});

describe('jsxs', () => {
  it('should work same as jsx', () => {
    const element = jsxs('div', {
      children: [jsx('span', { children: 'Child' })],
    });

    expect(element.tagName).toBe('DIV');
    expect(element.children.length).toBe(1);
  });
});
