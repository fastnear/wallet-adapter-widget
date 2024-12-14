import hereIcon from './icons/here.js';
import nearIcon from './icons/near.js';
import meteorIcon from './icons/meteor.js';
import { createHereAdapter } from './adapters/here.js';
import { createNearAdapter } from './adapters/near.js';
import { createMeteorAdapter } from './adapters/meteor.js';

export const wallets = [
  {
    id: 'near',
    name: 'NEAR Wallet',
    icon: nearIcon,
    adapter: createNearAdapter()
  },
  {
    id: 'here',
    name: 'HERE Wallet',
    icon: hereIcon,
    adapter: createHereAdapter()
  },
  {
    id: 'meteor',
    name: 'Meteor Wallet',
    icon: meteorIcon,
    adapter: createMeteorAdapter()
  }
];