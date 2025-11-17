import { Input } from '@heroui/react';
import { UserProfile } from '../UserProfile';

export default function Header() {
  return (
    <div className='container-header mb-2 flex items-center justify-between'>
      <h1>Smart Shop</h1>
      <Input
        type='text'
        name='search-bar'
        id='search-bar'
        placeholder='Search products...'
        size='md'
        className='max-w-md'
      />
      <UserProfile />
    </div>
  );
}
