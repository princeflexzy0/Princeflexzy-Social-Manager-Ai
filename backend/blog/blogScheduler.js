const { supabase } = require('../services/pgClient');
const logger = require('../utils/logger');

const publishPendingBlogs = async () => {
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', false)
    .limit(5);

  if (error) {
    logger.error(`[BLOG_SCHEDULER] DB Error: ${error.message}`);
    return;
  }

  if (!blogs.length) {
    logger.info(`[BLOG_SCHEDULER] No blogs to publish`);
    return;
  }

  for (const blog of blogs) {
    try {

      await supabase.from('blogs').update({ published: true }).eq('id', blog.id);
      logger.info(`[BLOG_SCHEDULER] Published blog: ${blog.title}`);
    } catch (err) {
      logger.error(`[BLOG_SCHEDULER] Error publishing "${blog.title}": ${err.message}`);
    }
  }
};

module.exports = { publishPendingBlogs };
