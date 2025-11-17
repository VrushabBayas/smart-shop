import { useState } from 'react';
import { HiOutlineLogin } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';
import LoginModal from '../Modal';
import { useDisclosure } from '@heroui/modal';
import { Button } from '@heroui/react';
import { login } from '../../Api';
export const UserProfile = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [username, setUsername] = useState<string | null>(null);
  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    // Handle login submission logic here
    const {
      data: { token, username },
    } = await login(email, password);
    if (token) {
      onOpenChange();
      setUsername(username);
    }
  };
  return (
    <div>
      <div className='flex items-center cursor-pointer justify-between'>
        {!username && (
          <Button variant='flat' size='md' color='primary' onClick={onOpen}>
            <HiOutlineLogin />
            Login
          </Button>
        )}
        {username && (
          <div className='flex items-center gap-2'>
            <FaUserCircle /> {username}
          </div>
        )}
      </div>
      <LoginModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
