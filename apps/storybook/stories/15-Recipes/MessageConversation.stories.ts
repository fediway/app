import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent, ref } from 'vue';
import ChatHeader from '@/components/chat/ChatHeader.vue';
import MessageBubble from '@/components/chat/MessageBubble.vue';
import MessageInput from '@/components/chat/MessageInput.vue';

const MessageConversation = defineComponent({
  name: 'MessageConversation',
  components: { ChatHeader, MessageBubble, MessageInput },
  setup() {
    const newMessage = ref('');
    const participant = {
      avatar: 'https://picsum.photos/seed/sarah/200/200',
      displayName: 'Sarah Chen',
      acct: 'sarah@mastodon.social',
    };

    const messages = [
      { id: '1', content: 'Hey! Did you see the new component library?', isOwn: false, sentAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', content: 'Yes! The storybook setup is really clean.', isOwn: true, sentAt: new Date(Date.now() - 3000000).toISOString() },
      { id: '3', content: 'I love the naming conventions. Profile* vs Account* makes so much sense.', isOwn: false, sentAt: new Date(Date.now() - 2400000).toISOString() },
      { id: '4', content: 'Right? And the way Status absorbs FeedItem is elegant.', isOwn: true, sentAt: new Date(Date.now() - 1800000).toISOString() },
      { id: '5', content: 'Should we schedule a review with the whole team?', isOwn: false, sentAt: new Date(Date.now() - 600000).toISOString() },
    ];

    return { participant, messages, newMessage };
  },
  template: `
    <div style="max-width: 500px; height: 600px" class="flex flex-col border border-border rounded-xl overflow-hidden">
      <ChatHeader :participant="participant" />

      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <MessageBubble
          v-for="msg in messages"
          :key="msg.id"
          :content="msg.content"
          :is-own="msg.isOwn"
          :sent-at="msg.sentAt"
        />
      </div>

      <div class="border-t border-border px-4 py-3">
        <MessageInput v-model="newMessage" />
      </div>
    </div>
  `,
});

const meta = {
  title: '15-Recipes/Message Conversation',
  component: MessageConversation,
  tags: ['autodocs'],
} satisfies Meta<typeof MessageConversation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
