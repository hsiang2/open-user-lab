'use server';

import { auth, signIn, signOut } from "@/auth";
import { avatarSchema, signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { Avatar } from "@/types";
import { AVATAR_BACKGROUND, AVATAR_STYLE } from "../constants";

export async function signInWithCredentials(prevState: unknown, formData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password')
        })

        await signIn('credentials', user);

        return { success: true, message: 'Signed in successfully' }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: 'Invalid email or password' }
    }
}

export async function signOutUser() {
    await signOut();
}

export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            isResearcher: formData.get('isResearcher') === 'true',
            institution: formData.get('institution')?.toString().trim() || undefined,
        });

        const plainPassword = user.password;

        user.password = hashSync(user.password, 10);

        const createdUser = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
                isResearcher: user.isResearcher,
                institution: user.institution,
            }
        })

        await prisma.userProfile.create({
            data: {
                userId: createdUser.id,
                language: [],
                background: [],
                avatarBase:  AVATAR_STYLE[0],
                avatarBg:  AVATAR_BACKGROUND[0]
            }
        })

        await signIn('credentials', {
            email: user.email,
            password: plainPassword,
        })

        return { success: true, message: 'User registered successfully' }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return { success: false, message: formatError(error) }
    }
}

// Get user by the ID
export async function getUserById(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

export async function updateUserAvatar(data: Avatar) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error('User not found');

    const avatar = avatarSchema.parse(data);

    await prisma.userProfile.upsert({
        where: { userId: currentUser.id }, 
        update: {
          avatarBase: avatar.avatarBase,
          avatarAccessory: avatar.avatarAccessory,
          avatarBg: avatar.avatarBg,
        },
        create: {
          userId: currentUser.id,
          avatarBase: avatar.avatarBase,
          avatarAccessory: avatar.avatarAccessory,
          avatarBg: avatar.avatarBg,
        },
      });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}