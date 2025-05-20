/**
 * 阿里云通义万相图像编辑API服务
 */

// 发送去水印请求
export const removeWatermark = async (imageUrl, apiKey) => {
  try {
    const response = await fetch('/api/v1/services/aigc/image2image/image-synthesis', {
      method: 'POST',
      headers: {
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wanx2.1-imageedit',
        input: {
          function: 'remove_watermark',
          prompt: '去除图像中的文字',
          base_image_url: imageUrl
        },
        parameters: {
          n: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('去水印请求失败:', error);
    throw error;
  }
};

// 查询任务状态
export const checkTaskStatus = async (taskId, apiKey) => {
  try {
    const response = await fetch(`/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`状态查询失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('任务状态查询失败:', error);
    throw error;
  }
};

// 处理不同类型的图像编辑功能
export const processImage = async (imageUrl, apiKey, functionType = 'remove_watermark', prompt = '去除图像中的文字', parameters = {
  n: 1
}) => {
  try {
    const response = await fetch('/api/v1/services/aigc/image2image/image-synthesis', {
      method: 'POST',
      headers: {
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wanx2.1-imageedit',
        input: {
          function: functionType,
          prompt: prompt,
          base_image_url: imageUrl
        },
        parameters: {
          n: 1,
          ...parameters
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('图像处理请求失败:', error);
    throw error;
  }
};