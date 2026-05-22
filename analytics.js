// Vercel Web Analytics initialization
// This script injects the Vercel Analytics tracking code
import { inject } from 'https://esm.sh/@vercel/analytics@1.6.1';

// Initialize analytics
inject({
  mode: 'auto',
  debug: false
});
