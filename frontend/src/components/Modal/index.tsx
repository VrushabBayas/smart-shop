import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@heroui/react';

export default function LoginModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: { email: string; password: string }) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    if (!email || !password) return;
    if (onSubmit) onSubmit({ email, password });
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Login to your account
              </ModalHeader>
              <ModalBody>
                <Input
                  type='email'
                  placeholder='Email'
                  className='mb-4'
                  onChange={handleEmailChange}
                />
                <Input
                  type='password'
                  placeholder='Password'
                  onChange={handlePasswordChange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button color='primary' onPress={handleSubmit}>
                  Login
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
