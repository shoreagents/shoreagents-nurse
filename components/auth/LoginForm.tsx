import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, LoginFormData } from '@/lib/validations'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm() {
  const { login, isLoading, error } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with data:', data)
    
    // Extra validation - make sure we have email and password
    if (!data.email || !data.password) {
      toast({
        title: "Login failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const result = await login(data)
      console.log('Login result:', result)
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Please check your credentials and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">SA</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Demo Mode - Any email/password works!
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any email (e.g., nurse@demo.com)"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Any password (e.g., demo)"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                onClick={(e) => {
                  console.log('Sign in button clicked')
                  console.log('Form values:', form.getValues())
                  // Don't prevent default - let the form handle it
                }}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or use quick login
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  console.log('Quick login as nurse clicked')
                  try {
                    const result = await login({ email: 'nurse@demo.com', password: 'demo' })
                    console.log('Quick login result:', result)
                    if (result.success) {
                      toast({
                        title: "Login successful",
                        description: "Welcome, Nurse!",
                      })
                    }
                  } catch (error) {
                    console.error('Quick login error:', error)
                  }
                }}
              >
                Login as Nurse
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  console.log('Quick login as admin clicked')
                  try {
                    const result = await login({ email: 'admin@demo.com', password: 'demo' })
                    console.log('Quick login result:', result)
                    if (result.success) {
                      toast({
                        title: "Login successful",
                        description: "Welcome, Admin!",
                      })
                    }
                  } catch (error) {
                    console.error('Quick login error:', error)
                  }
                }}
              >
                Login as Admin
              </Button>
            </div>
            
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>Demo Mode: Any email/password works!</p>
              <p>Use &quot;admin&quot; in email for admin role, otherwise defaults to nurse</p>
              
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => {
                  console.log('Emergency login button clicked')
                  // Direct login bypass for testing
                  window.location.reload()
                }}
                className="text-xs underline"
              >
                Having trouble? Click here to refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 