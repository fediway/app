import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProfileActions from '../ProfileActions.vue';

describe('profileActions', () => {
  it('shows Follow and Message for other profiles', () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: false },
    });
    expect(wrapper.text()).toContain('Follow');
    expect(wrapper.text()).toContain('Message');
    expect(wrapper.text()).not.toContain('Edit Profile');
  });

  it('shows Edit Profile for own profile', () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: true },
    });
    expect(wrapper.text()).toContain('Edit Profile');
    expect(wrapper.text()).not.toContain('Follow');
    expect(wrapper.text()).not.toContain('Message');
  });

  it('shows Following when already following', () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: false, following: true },
    });
    expect(wrapper.text()).toContain('Following');
    expect(wrapper.text()).not.toContain('Edit Profile');
  });

  it('shows Requested when follow is pending', () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: false, requested: true },
    });
    expect(wrapper.text()).toContain('Requested');
  });

  it('emits follow when clicking Follow', async () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: false, following: false },
    });
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('follow')).toHaveLength(1);
  });

  it('emits unfollow when clicking Following', async () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: false, following: true },
    });
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('unfollow')).toHaveLength(1);
  });

  it('emits editProfile when clicking Edit Profile', async () => {
    const wrapper = mount(ProfileActions, {
      props: { isOwnProfile: true },
    });
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.emitted('editProfile')).toHaveLength(1);
  });
});
