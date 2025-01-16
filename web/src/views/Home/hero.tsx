import Link from '@mui/material/Link'

export default function Hero() {
  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 叠加一个半透明的黑色层，使文字更易读 */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
          Chirou API
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-8">
          企业级AI接口调用平台
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/signup" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-lg transition duration-300"
          >
            立即注册
          </Link>
          <Link 
            href="/learn-more" 
            className="bg-transparent hover:bg-white hover:text-blue-600 text-white font-bold py-2 px-6 rounded-full border-2 border-white text-lg transition duration-300"
          >
            了解更多
          </Link>
        </div>
      </div>
    </div>
  )
}

