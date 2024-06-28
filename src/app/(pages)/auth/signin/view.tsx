'use client'
import Image from "next/image";
import {
  Anchor,
  Box,
  Button,
  Container,
  Grid,
  Input,
  PasswordInput,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import classes from "./styles.module.scss";
import { IconAt, IconBrandGithub, IconBuildingStore, IconShieldLock } from '@tabler/icons-react';
import { Form, useForm, zodResolver } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { SignInFormType, SignInValidateSchema } from "@/app/(pages)/auth/signin/types";
import { onSubmitCredentialsSignIn, onSubmitGitHubSignIn } from "@/app/actions/auth/actions";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function SigninView() {
  const { height } = useViewportSize();
  const [ onSubmitCredentialsLoading, hadleCredentials ] = useState(false);
  const [ onSubmitGitHubLoading, handleGitHub ] = useState(false);
  const form = useForm<SignInFormType>({
    initialValues: {
      email: String(),
      password: String(),
    },
    validate: zodResolver(SignInValidateSchema)
  });

  async function submitCredentialsSignIn() {
    form.validate();
    try {
      if (form.isValid()) {
        hadleCredentials(true);
        await onSubmitCredentialsSignIn(form.values.email, form.values.password);
      }
    } catch (error) {
      form.setErrors({
        email: 'Email ou senha inválidos',
        password: 'Email ou senha inválidos'
      });
      hadleCredentials(false);
    }
  }

  async function submitGitHubSignIn() {
    handleGitHub(true);
    form.reset();
    try {
      await onSubmitGitHubSignIn();
    } catch (error) {
      toast.error('Erro ao tentar autenticar com GitHub');
      handleGitHub(false);
    }
  }

  return (
    <Grid gutter={0}>
      <Grid.Col className={classes.aside} span='auto'>
        <Container size='xl' p='xl'>
          <Stack
            mih={height - 64}
            align="center"
            justify="center"
            gap="md">
            <ThemeIcon
              variant='light'
              radius={14}
              size={'15rem'}>
              <IconBuildingStore className={classes.iconBuildingStore} stroke={0.6}/>
            </ThemeIcon>
            <Text
              className={classes.illustrationText}
              mt='lg'
              size='1.5rem'>
              A forma mais simples de gerenciar seu marketplace
            </Text>
          </Stack>
        </Container>
      </Grid.Col>
      <Grid.Col className={classes.authForm} span='auto'>
        <Form form={form}>
          <Container mih={height} size='xs' p='xl'>
            <Stack
              mih={height - 64}
              align="center"
              justify="center"
              gap="md">
              <Box mb='xl'>
                <Image
                  priority
                  width={200}
                  height={67}
                  src='/img/logo.png'
                  alt='logo img'/>
              </Box>
              <Input
                {...form.getInputProps('email')}
                name='email'
                type='email'
                className={classes.input}
                leftSection={<IconAt size='1.1rem'/>}
                placeholder="Email"
                size="lg"
                mt='xl'
              />
              <PasswordInput
                {...form.getInputProps('password')}
                className={classes.input}
                name='password'
                type='password'
                leftSection={<IconShieldLock size='1.1rem'/>}
                size='lg'
                placeholder="Senha"
              />
              <Button
                onClick={submitCredentialsSignIn}
                className={classes.signinButton}
                loading={onSubmitCredentialsLoading}
                disabled={onSubmitCredentialsLoading}
                variant='outline'
                size='lg'
                color='blue.4'
                type='submit'>
                Entrar
              </Button>
              <Anchor
                underline='always'
                href={'/auth/signup'}>
                Não tem uma conta? Clique aqui
              </Anchor>
              <Text c='dimmed' size='lg'>ou</Text>
              <Button
                onClick={submitGitHubSignIn}
                className={classes.signinButton}
                loading={onSubmitGitHubLoading}
                disabled={onSubmitGitHubLoading}
                id={'signin-github'}
                variant='light'
                size='lg'
                color='blue.4'
                leftSection={<IconBrandGithub size='1.8rem'/>}
                type='submit'>
                Entrar com GitHub
              </Button>
            </Stack>
          </Container>
        </Form>
      </Grid.Col>
    </Grid>
  )
}
