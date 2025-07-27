import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dashboardStorage } from '../lib/storage'
import { inventoryMedicineStorage, inventorySupplyStorage } from '../lib/storage'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Banknote, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  User,
  Package,
  Receipt,
  Eye,
  Calendar,
  BarChart3,
  Pill,
  Boxes,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { MonitorCheckIcon, CircleDollarSignIcon, PillAnimated, ThermometerIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { InventoryMedicine, InventorySupply } from '../lib/types'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(() => dashboardStorage.getStats())
  const [isLoading, setIsLoading] = useState(false)
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3months' | '30days' | '7days'>('3months')
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  // Load data lazily after component mounts
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      try {
        // Small delay to allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 10))
        const newStats = dashboardStorage.getStats()
        setStats(newStats)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const loadInventory = async () => {
      try {
        const [medicineData, supplyData] = await Promise.all([
          inventoryMedicineStorage.getAll(),
          inventorySupplyStorage.getAll()
        ])
        setMedicines(medicineData)
        setSupplies(supplyData)
      } catch (error) {
        console.error('Error loading inventory:', error)
      }
    }

    loadStats()
    loadInventory()
  }, [])

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalMedicines = medicines.length
    const totalSupplies = supplies.length
    const lowStockMedicines = medicines.filter(m => m.stock <= m.reorder_level).length
    const lowStockSupplies = supplies.filter(s => s.stock <= s.reorder_level).length
    const outOfStockMedicines = medicines.filter(m => m.stock === 0).length
    const outOfStockSupplies = supplies.filter(s => s.stock === 0).length
    const totalMedicineValue = medicines.reduce((sum, m) => sum + (m.price || 0) * m.stock, 0)
    const totalSupplyValue = supplies.reduce((sum, s) => sum + (s.price || 0) * s.stock, 0)

    return {
      totalMedicines,
      totalSupplies,
      lowStockMedicines,
      lowStockSupplies,
      outOfStockMedicines,
      outOfStockSupplies,
      totalMedicineValue,
      totalSupplyValue,
      totalInventoryValue: totalMedicineValue + totalSupplyValue
    }
  }, [medicines, supplies])

  // Chart data for visitors summary
  const getChartData = (timeRange: '3months' | '30days' | '7days') => {
    const dataMap = {
      '3months': {
        labels: ['Apr 6', 'Apr 12', 'Apr 18', 'Apr 24', 'Apr 30', 'May 6', 'May 12', 'May 18', 'May 24', 'May 30', 'Jun 5', 'Jun 11', 'Jun 17', 'Jun 23', 'Jun 30'],
        data: [45, 52, 38, 61, 47, 68, 55, 72, 49, 58, 63, 71, 56, 64, 59],
        total: 1234
      },
      '30days': {
        labels: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 11', 'Jun 13', 'Jun 15', 'Jun 17', 'Jun 19', 'Jun 21', 'Jun 23', 'Jun 25', 'Jun 27', 'Jun 29'],
        data: [58, 62, 67, 71, 65, 69, 73, 68, 72, 66, 70, 74, 69, 73, 71],
        total: 456
      },
      '7days': {
        labels: ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30'],
        data: [72, 68, 75, 71, 69, 73, 70],
        total: 123
      }
    }

    const chartData = dataMap[timeRange]
    
    return {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Visitors',
          data: chartData.data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: function(context: any) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) {
              return;
            }
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
            return gradient;
          },
          borderWidth: 1.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: 'rgb(34, 197, 94)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    }
  }

  const visitorsChartData = getChartData(selectedTimeRange)

  const visitorsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart' as const
    },
    transitions: {
      active: {
        animation: {
          duration: 1200,
          easing: 'easeInOutQuart' as const
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false as const,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#6b7280',
        bodyColor: '#374151',
        borderColor: 'hsl(162, 60%, 85%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        caretSize: 0,
        padding: 12,
        boxPadding: 6,
        usePointStyle: false,
        callbacks: {
          title: function(context: any) {
            if (context && context[0]) {
              const labels = context[0].chart.data.labels;
              const dataIndex = context[0].dataIndex;
              const date = labels[dataIndex];
              return `${date}`;
            }
            return '';
          }
        },
        titleFont: {
          weight: 500
        },
        bodyFont: {
          weight: 400
        }
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }

  // Calculate additional statistics - memoized to prevent recalculation
  const extendedStats = useMemo(() => {
    const currentMonth = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    // Use basic stats if full data isn't loaded yet
    if (!stats.recentActivity) {
      return {
        ...stats,
        thisMonthClinicLogs: 0,
        thisMonthReimbursements: 0,
        approvedReimbursements: 0,
        rejectedReimbursements: 0,
        approvedReimbursementAmount: 0,
        pendingReimbursementAmount: 0,
        averageReimbursementAmount: 0,
        recentActivity: []
      }
    }

    return {
      ...stats,
      thisMonthClinicLogs: Math.round(stats.totalClinicLogs * 0.3), // Approximate
      thisMonthReimbursements: Math.round(stats.totalReimbursements * 0.25), // Approximate
      approvedReimbursements: Math.round(stats.totalReimbursements * 0.6), // Approximate
      rejectedReimbursements: Math.round(stats.totalReimbursements * 0.1), // Approximate
      approvedReimbursementAmount: stats.totalReimbursementAmount * 0.8,
      pendingReimbursementAmount: stats.totalReimbursementAmount * 0.2,
      averageReimbursementAmount: stats.totalReimbursements > 0 ? stats.totalReimbursementAmount / stats.totalReimbursements : 0,
      recentActivity: stats.recentActivity || []
    }
  }, [stats])

  const quickActions = useMemo(() => [
    {
      title: 'New Clinic Log',
      description: 'Record patient visits',
      icon: MonitorCheckIcon,
      href: '/clinic-log-form',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Reimbursement',
      description: 'Submit reimbursement request',
      icon: CircleDollarSignIcon,
      href: '/reimbursement-form',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Add Medicines',
      description: 'Add new medicine to inventory',
      icon: PillAnimated,
      href: '/medicines?action=add',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Add Supplies',
      description: 'Add new supplies to inventory',
      icon: ThermometerIcon,
      href: '/supplies?action=add',
      bgColor: 'bg-orange-50'
    }
  ], [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  return (
    <div className="bg-gray-50 min-h-0 flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}! Here's your overview.
              </p>
            </div>
          </div>

          {/* Inventory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Total Visitors</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">John Smith</div>
                  <div className="text-xs text-muted-foreground">Maria Garcia</div>
                  <div className="text-xs text-muted-foreground">David Johnson</div>
                  <div className="text-xs text-muted-foreground">Sarah Wilson</div>
                  <div className="text-xs text-muted-foreground">Michael Brown</div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Visitors Summary</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getChartData(selectedTimeRange).datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total for the {selectedTimeRange === '3months' ? 'last 3 months' : selectedTimeRange === '30days' ? 'last 30 days' : 'last 7 days'}
                </p>
                <div className="flex items-center space-x-1 mt-4">
                  <button 
                    onClick={() => setSelectedTimeRange('3months')}
                    className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedTimeRange === '3months' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-green-200'
                    }`}
                  >
                    Last 3 months
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('30days')}
                    className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedTimeRange === '30days' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-green-200'
                    }`}
                  >
                    Last 30 days
                  </button>
                  <button 
                    onClick={() => setSelectedTimeRange('7days')}
                    className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedTimeRange === '7days' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-green-200'
                    }`}
                  >
                    Last 7 days
                  </button>
                </div>
              </CardContent>
              <div className="h-[160px] -mx-[1px] -mb-[1px]">
                <Line data={visitorsChartData} options={visitorsChartOptions} />
              </div>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Medicine Inventory</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">{inventoryStats.totalMedicines}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">
                      {inventoryStats.lowStockMedicines}
                    </div>
                    <div className="text-xs text-neural-blue-500">Low Stock</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">
                      {inventoryStats.outOfStockMedicines}
                    </div>
                    <div className="text-xs text-red-600">Out of Stock</div>
                  </div>
                </div>
                {(inventoryStats.outOfStockMedicines > 0 || inventoryStats.lowStockMedicines > 0) && (
                  <div className="mt-3 space-y-1">
                    <div className={`space-y-1 ${(medicines.filter(m => m.stock === 0).length + medicines.filter(m => m.stock > 0 && m.stock <= m.reorder_level).length) > 6 ? 'max-h-[148px] overflow-y-auto' : ''}`}>
                      {medicines.filter(m => m.stock === 0).map((medicine) => (
                        <div key={medicine.id} className="flex items-center gap-2">
                          <span className="text-xs">{medicine.name}</span>
                          <Badge className="text-[10px] px-1.5 py-0.5 bg-red-400 text-white hover:bg-red-400">Out of Stock</Badge>
                        </div>
                      ))}
                      {medicines.filter(m => m.stock > 0 && m.stock <= m.reorder_level).map((medicine) => (
                        <div key={medicine.id} className="flex items-center gap-2">
                          <span className="text-xs">{medicine.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Low Stock ({medicine.stock})</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Supply Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">{inventoryStats.totalSupplies}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">
                      {inventoryStats.lowStockSupplies}
                    </div>
                    <div className="text-xs text-neural-blue-500">Low Stock</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 flex-1 text-center">
                    <div className="text-2xl font-bold">
                      {inventoryStats.outOfStockSupplies}
                    </div>
                    <div className="text-xs text-red-600">Out of Stock</div>
                  </div>
                </div>
                {(inventoryStats.outOfStockSupplies > 0 || inventoryStats.lowStockSupplies > 0) && (
                  <div className="mt-3 space-y-1">
                    <div className={`space-y-1 ${(supplies.filter(s => s.stock === 0).length + supplies.filter(s => s.stock > 0 && s.stock <= s.reorder_level).length) > 6 ? 'max-h-[148px] overflow-y-auto' : ''}`}>
                      {supplies.filter(s => s.stock === 0).map((supply) => (
                        <div key={supply.id} className="flex items-center gap-2">
                          <span className="text-xs">{supply.name}</span>
                          <Badge className="text-[10px] px-1.5 py-0.5 bg-red-400 text-white hover:bg-red-400">Out of Stock</Badge>
                        </div>
                      ))}
                      {supplies.filter(s => s.stock > 0 && s.stock <= s.reorder_level).map((supply) => (
                        <div key={supply.id} className="flex items-center gap-2">
                          <span className="text-xs">{supply.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Low Stock ({supply.stock})</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>







          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-6">
                  Latest updates and actions
                </CardDescription>
                {extendedStats.recentActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-xs mt-1">Activity will appear here as you use the app</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extendedStats.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(activity.status || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {activity.title}
                            </p>
                            {activity.status && (
                              <Badge variant={getStatusColor(activity.status) as any} className="ml-2">
                                {activity.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(activity.timestamp, 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {extendedStats.recentActivity.length > 5 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-muted-foreground">
                          Showing 5 of {extendedStats.recentActivity.length} activities
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-6">
                  Common tasks you can perform
                </CardDescription>
                <div className="grid grid-cols-1 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                                            <Button
                        key={action.title}
                        variant="outline"
                        className={`h-auto p-4 justify-start ${action.bgColor} ${
                          action.bgColor === 'bg-blue-50' ? 'hover:bg-blue-100' :
                          action.bgColor === 'bg-amber-50' ? 'hover:bg-amber-100' :
                          action.bgColor === 'bg-purple-50' ? 'hover:bg-purple-100' :
                          action.bgColor === 'bg-orange-50' ? 'hover:bg-orange-100' :
                          ''
                        }`}
                        onClick={() => handleQuickAction(action.href)}
                        onMouseEnter={() => setHoveredAction(action.title)}
                        onMouseLeave={() => setHoveredAction(null)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className="p-2">
                              {Icon === MonitorCheckIcon ? (
                                <MonitorCheckIcon 
                                  className="h-5 w-5 text-blue-600" 
                                  animate={hoveredAction === action.title}
                                />
                              ) : Icon === CircleDollarSignIcon ? (
                                <CircleDollarSignIcon 
                                  className="h-5 w-5 text-amber-600" 
                                  animate={hoveredAction === action.title}
                                />
                              ) : Icon === PillAnimated ? (
                                <PillAnimated 
                                  className="h-5 w-5 text-purple-600" 
                                  animate={hoveredAction === action.title}
                                />
                              ) : Icon === ThermometerIcon ? (
                                <ThermometerIcon 
                                  className="h-5 w-5 text-orange-600" 
                                  animate={hoveredAction === action.title}
                                />
                              ) : (
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-foreground">{action.title}</div>
                              <div className={`text-xs font-normal ${
                                action.bgColor === 'bg-blue-50' ? 'text-blue-600' :
                                action.bgColor === 'bg-amber-50' ? 'text-amber-600' :
                                action.bgColor === 'bg-purple-50' ? 'text-purple-600' :
                                action.bgColor === 'bg-orange-50' ? 'text-orange-600' :
                                'text-muted-foreground'
                              }`}>
                                {action.description}
                              </div>
                            </div>
                          </div>
                          <ArrowRight 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              hoveredAction === action.title ? 'translate-x-1' : 'translate-x-0'
                            } ${
                              action.bgColor === 'bg-blue-50' ? 'text-blue-600' :
                              action.bgColor === 'bg-amber-50' ? 'text-amber-600' :
                              action.bgColor === 'bg-purple-50' ? 'text-purple-600' :
                              action.bgColor === 'bg-orange-50' ? 'text-orange-600' :
                              'text-muted-foreground'
                            }`}
                          />
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 