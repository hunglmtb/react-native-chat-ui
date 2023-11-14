import * as React from 'react'
import {Image, Pressable, StyleSheet, Text, View} from 'react-native'

import { MessageType, Theme } from '../../types'
import { getUserAvatarNameColor, getUserInitials } from '../../utils'
import {useEffect, useState} from "react";

export const Avatar = React.memo(
  ({
    author,
    currentUserIsAuthor,
    showAvatar,
    showUserAvatars,
    theme,
    onAvatarPress
  }: {
    author: MessageType.Any['author']
    currentUserIsAuthor: boolean
    showAvatar: boolean
    showUserAvatars?: boolean
    theme: Theme
    onAvatarPress?: (author: MessageType.Any['author']) => void
  }) => {
      const {imageUrl: originImageUrl, asyncLoadAvatar} = author || {}
      const [loading, setLoading] = useState(false)
      const [imageUrl, setImageUrl] = useState(originImageUrl)
      useEffect(()=>{
          if(!imageUrl && !loading) asyncLoadAvatar?.().then((imgUrl) => {
              setLoading(true)
              setImageUrl(imgUrl)
          })
      }, [imageUrl, loading, asyncLoadAvatar])
    const renderAvatar = () => {
      if (imageUrl) {
        return (
          <Image
            accessibilityRole='image'
            resizeMode='cover'
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              theme.avatar?.image || {},
              { backgroundColor: theme.colors.userAvatarImageBackground },
            ]}
          />
        )
      }

      const color = getUserAvatarNameColor(author, theme.colors.userAvatarNameColors)
      const initials = getUserInitials(author)
      return (
        <View style={[styles.avatarBackground, theme.avatar?.image || {}, { backgroundColor: color }]}>
          <Text style={theme.fonts.userAvatarTextStyle}>{initials}</Text>
        </View>
      )
    }

    return !currentUserIsAuthor && showUserAvatars ? (
      <Pressable
          testID='AvatarContainer'
          onPress={onAvatarPress ? () => onAvatarPress?.(author) : undefined}
      >
        {showAvatar ? renderAvatar() : <View style={[styles.placeholder, theme.avatar?.image]} />}
      </Pressable>
    ) : null
  }
)

const styles = StyleSheet.create({
  avatarBackground: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  image: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  placeholder: {
    width: 40,
  },
})
