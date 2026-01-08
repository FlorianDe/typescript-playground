/**
 * Router System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { route, createRouter, Router } from '../src/router';

describe('Route', () => {
  it('should create route with path', () => {
    const homeRoute = route('/');
    expect(homeRoute.path).toBe('/');
  });

  it('should extract parameter keys', () => {
    const userRoute = route('/user/:id');
    expect(userRoute.keys).toEqual(['id']);
  });

  it('should extract multiple parameter keys', () => {
    const postRoute = route('/user/:userId/post/:postId');
    expect(postRoute.keys).toEqual(['userId', 'postId']);
  });

  it('should create pattern for matching', () => {
    const userRoute = route('/user/:id');
    expect(userRoute.pattern.test('/user/123')).toBe(true);
    expect(userRoute.pattern.test('/user/abc')).toBe(true);
    expect(userRoute.pattern.test('/user')).toBe(false);
    expect(userRoute.pattern.test('/user/123/extra')).toBe(false);
  });

  it('should match wildcard routes', () => {
    const notFoundRoute = route('*');
    expect(notFoundRoute.pattern.test('/anything')).toBe(true);
    expect(notFoundRoute.pattern.test('/a/b/c')).toBe(true);
  });
});

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    router = createRouter({
      routes: {
        home: route('/'),
        user: route('/user/:id'),
        post: route('/post/:postId'),
        notFound: route('*'),
      },
      strategy: 'memory',
    });
  });

  it('should create router with initial route', () => {
    expect(router.current.value).toBeDefined();
    expect(router.current.value.path).toBe('/');
  });

  it('should navigate to route', () => {
    router.navigate('/user/123');
    expect(router.current.value.path).toBe('/user/123');
  });

  it('should extract route parameters', () => {
    router.navigate('/user/456');
    expect(router.current.value.params).toEqual({ id: '456' });
  });

  it('should extract multiple parameters', () => {
    const multiRouter = createRouter({
      routes: {
        post: route('/user/:userId/post/:postId'),
      },
      strategy: 'memory',
    });

    multiRouter.navigate('/user/123/post/456');
    expect(multiRouter.current.value.params).toEqual({
      userId: '123',
      postId: '456',
    });
  });

  it('should navigate using route object and params', () => {
    const routes = {
      user: route('/user/:id'),
    };

    const r = createRouter({
      routes,
      strategy: 'memory',
    });

    r.navigate(routes.user, { id: '789' });
    expect(r.current.value.path).toBe('/user/789');
    expect(r.current.value.params).toEqual({ id: '789' });
  });

  it('should call navigation guards', () => {
    const guardCalls: string[] = [];

    router.beforeEach((to, from, next) => {
      guardCalls.push(`${from.path} -> ${to.path}`);
      next();
    });

    router.navigate('/user/123');
    expect(guardCalls).toContain('/ -> /user/123');
  });

  it('should redirect in guard', () => {
    router.beforeEach((to, from, next) => {
      if (to.path === '/protected') {
        next('/');
      } else {
        next();
      }
    });

    router.navigate('/protected');
    expect(router.current.value.path).toBe('/');
  });

  it('should remove guard when unregister is called', () => {
    const guardCalls: string[] = [];

    const unregister = router.beforeEach((to, from, next) => {
      guardCalls.push('guard');
      next();
    });

    router.navigate('/user/1');
    expect(guardCalls).toHaveLength(1);

    unregister();

    router.navigate('/user/2');
    expect(guardCalls).toHaveLength(1); // Should not increase
  });

  it('should match wildcard route', () => {
    router.navigate('/unknown/path');
    expect(router.current.value.path).toBe('/unknown/path');
    expect(router.current.value.params).toEqual({});
  });

  it('should call onNavigate callback', () => {
    const navigations: string[] = [];

    const r = createRouter({
      routes: {
        home: route('/'),
        about: route('/about'),
      },
      strategy: 'memory',
      onNavigate: (to, from) => {
        navigations.push(`${from.path} -> ${to.path}`);
      },
    });

    r.navigate('/about');

    // Wait for effect
    setTimeout(() => {
      expect(navigations.length).toBeGreaterThan(0);
    }, 10);
  });
});
