require 'zip'
require 'fileutils'
require 'json'

Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll.logger.info "Press Kit ZIP:", "Starting press kit ZIP generation..."
  
  press_kit_dir = File.join(site.source, 'assets', 'press-kit')
  output_dir = File.join(site.dest, 'assets', 'press-kit')
  zip_file = File.join(output_dir, 'vrton-complete-press-kit.zip')
  
  # Ensure output directory exists
  FileUtils.mkdir_p(output_dir)
  
  # Only create ZIP if press-kit directory exists
  unless Dir.exist?(press_kit_dir)
    Jekyll.logger.warn "Press Kit ZIP:", "Press kit directory not found: #{press_kit_dir}"
    return
  end

  Jekyll.logger.info "Press Kit ZIP:", "Creating ZIP file..."
  
  begin
    Zip::File.open(zip_file, Zip::File::CREATE) do |zipfile|
      file_count = 0
      
      # Add all files from the press-kit directory
      Dir.glob(File.join(press_kit_dir, '**', '*')).each do |file|
        if File.file?(file)
          # Get relative path for the ZIP
          relative_path = file.sub(press_kit_dir + File::SEPARATOR, '')
          zipfile.add(relative_path, file)
          file_count += 1
          Jekyll.logger.debug "Press Kit ZIP:", "Added: #{relative_path}"
        end
      end
      
      # Add README file with usage instructions
      readme_content = <<~README
        VRTon Press Kit
        ===============
        
        This ZIP file contains official VRTon promotional materials.
        
        Contents:
        - logos/: Official VRTon logos in various formats
        - posters/: World and event promotional posters
        - stickers/: Stickers and emojis for social platforms
        
        Total files: #{file_count}
        
        Usage Guidelines:
        ✅ Allowed:
        - Community content and fan art
        - Social media posts about VRTon
        - Event promotion and community activities
        - Educational content about VRChat
        
        ❌ Prohibited:
        - Commercial use without permission
        - Modification of official logos
        - Use in inappropriate or harmful content
        - Impersonation of official VRTon accounts
        
        Questions? Contact us through our official Discord server.
        
        Generated: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}
      README
      
      zipfile.get_output_stream('README.txt') { |f| f.write(readme_content) }
    end
    
    # Calculate file size for display
    file_size = File.size(zip_file)
    size_mb = (file_size / 1024.0 / 1024.0).round(1)
    
    Jekyll.logger.info "Press Kit ZIP:", "✅ ZIP created successfully: #{zip_file} (#{size_mb} MB)"
    
  rescue StandardError => e
    Jekyll.logger.error "Press Kit ZIP:", "❌ Error creating ZIP: #{e.message}"
  end
end