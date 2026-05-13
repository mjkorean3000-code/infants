import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://joointthbcwtntvqjaxr.supabase.co';
const supabaseKey = 'sb_publishable_WqaSHwNY0QHigLNmXPfGTQ_EeNiXm1v';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@onfans.club', // test influencer ID is 'test' so email would be 'test@onfans.club'
    password: '9321'
  });
  
  if (error) {
    console.error('test influencer login failed:', error.message);
  } else {
    console.log('test influencer login SUCCESS');
  }

  const adminTest = await supabase.auth.signInWithPassword({
    email: 'admin@onfans.club',
    password: 'admin' // just guessing
  });
  if (adminTest.error) {
    console.error('admin login failed:', adminTest.error.message);
  } else {
    console.log('admin login SUCCESS with password "admin"');
  }
}

main();
