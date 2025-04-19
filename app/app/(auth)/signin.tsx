import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'

const SignInScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'vendor' | 'customer' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg('')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg('No account found with this email and password. Please check your credentials or sign up.')
        return
      }

      const user = data?.user
      console.log(user)
      let userType = user?.user_metadata?.user_type
      console.log(userType)
      if (user) {
        const { data: customer, error: customerError } = await supabase
          .from('customer')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (customer) {
          userType = 'customer';
        }
      }
      if (userType === 'vendor') {
        router.replace('/(tabsVendor)/main')
      } else if (userType === 'customer') {
        router.replace('/(tabsCustomer)/main')
      } 
    } catch (error: any) {
      setErrorMsg(error.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Error Message Banner */}
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Header */}
      <LinearGradient
        colors={['#0066ff', '#0052cc']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/images/signin.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.signupPrompt}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* User Type Selection */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            style={[{
              flex: 1,
              marginRight: 8,
              borderWidth: 1,
              borderColor: userType === 'vendor' ? '#3399ff' : '#ccc',
              backgroundColor: userType === 'vendor' ? '#e6f2ff' : '#fff',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }]}
            onPress={() => setUserType('vendor')}
          >
            <Image
              source={require('../../assets/images/vendor.png')}
              style={{ width: 24, height: 24, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={{ color: userType === 'vendor' ? '#3399ff' : '#333', fontWeight: 'bold' }}>Vendor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[{
              flex: 1,
              marginLeft: 8,
              borderWidth: 1,
              borderColor: userType === 'customer' ? '#3399ff' : '#ccc',
              backgroundColor: userType === 'customer' ? '#e6f2ff' : '#fff',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }]}
            onPress={() => setUserType('customer')}
          >
            <Image
              source={require('../../assets/images/customer.png')}
              style={{ width: 24, height: 24, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={{ color: userType === 'customer' ? '#3399ff' : '#333', fontWeight: 'bold' }}>Customer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="********"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity 
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <MaterialIcons name="check" size={14} color="#0066ff" />
              )}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.signInButton}
          onPress={handleSignIn}
        >
          <Text style={styles.signInButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => {
              // Handle Google sign in
              console.log('Google sign in')
              router.push("/onboarding" as const)
            }}
          >
            <Image 
              source={require('../../assets/images/google.png')} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default SignInScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 340,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '50%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#333',
    marginBottom: 6,
  },
  signupPrompt: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  signupText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#0066ff',
    marginLeft: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  eyeIcon: {
    padding: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
  },
  forgotPassword: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#0066ff',
  },
  signInButton: {
    backgroundColor: '#0066ff',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0066ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  signInButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
});