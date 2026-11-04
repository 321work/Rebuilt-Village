/**
 * Public Givebutter identifiers for the inline donation form on /donate.
 * These are not secrets: they are the same values Givebutter puts in its
 * embed snippet. To point the form at a different campaign, create a Form
 * widget in Givebutter (campaign > Sharing > Widgets) and replace WIDGET_ID.
 */
export const GIVEBUTTER = {
  ACCOUNT_ID: 'qZFO5UaobNSTjDQr',
  WIDGET_ID: 'j9MbwK',
  LIBRARY_URL:
    'https://widgets.givebutter.com/latest.umd.cjs?acct=qZFO5UaobNSTjDQr&p=other',
} as const;
