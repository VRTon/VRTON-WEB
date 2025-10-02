require 'json'
require 'net/http'
require 'uri'
require 'digest'

module Jekyll
  class VPMListingGenerator < Generator
    safe true
    priority :low

    def generate(site)
      Jekyll.logger.info "VPM Listing:", "Starting VPM listing generation..."
      
      source_file = File.join(site.source, 'data', 'vpm-source.json')
      output_file = File.join(site.source, 'data', 'vpm-listing.json')
      
      unless File.exist?(source_file)
        Jekyll.logger.warn "VPM Listing:", "Source file not found: #{source_file}"
        return
      end

      begin
        # Load source configuration
        source_data = JSON.parse(File.read(source_file))
        Jekyll.logger.info "VPM Listing:", "Loaded source configuration: #{source_data['name']}"

        # Generate listing
        listing = process_source(source_data)
        
        # Save listing
        File.write(output_file, JSON.pretty_generate(listing))
        Jekyll.logger.info "VPM Listing:", "Generated VPM listing: #{output_file}"
        
        # Add the generated file to Jekyll's static files so it gets copied to _site
        site.static_files << Jekyll::StaticFile.new(site, site.source, 'data', 'vpm-listing.json')
        
      rescue => e
        Jekyll.logger.error "VPM Listing:", "Failed to generate listing: #{e.message}"
      end
    end

    private

    def process_source(source)
      listing = {
        'name' => source['name'],
        'author' => source['author']['name'],
        'url' => source['url'],
        'id' => source['id'],
        'packages' => {}
      }

      Jekyll.logger.info "VPM Listing:", "Processing #{source['packages'].length} packages..."

      source['packages'].each do |pkg|
        Jekyll.logger.info "VPM Listing:", "  Processing package: #{pkg['name']}"
        
        package_data = {
          'versions' => {}
        }

        pkg['releases'].each do |release_url|
          begin
            version = extract_version_from_url(release_url)
            Jekyll.logger.info "VPM Listing:", "    Processing version #{version}"

            version_data = {
              'name' => pkg['name'],
              'displayName' => generate_display_name(pkg['name']),
              'version' => version,
              'description' => generate_display_name(pkg['name']),
              'vpmDependencies' => get_default_dependencies,
              'author' => {
                'name' => source['author']['name'],
                'email' => source['author']['email'],
                'url' => source['author']['url']
              },
              'hideInEditor' => false,
              'zipSHA256' => calculate_sha256_placeholder(release_url),
              'url' => release_url
            }

            package_data['versions'][version] = version_data
          rescue => e
            Jekyll.logger.error "VPM Listing:", "    Failed to process release #{release_url}: #{e.message}"
          end
        end

        listing['packages'][pkg['name']] = package_data
      end

      listing
    end

    def extract_version_from_url(url)
      # Try to extract version from release path
      version_match = url.match(/\/releases\/download\/([^\/]+)\//)
      return version_match[1] if version_match

      # Fallback: try to extract from filename
      file_match = url.match(/([0-9]+\.[0-9]+\.[0-9]+)/)
      return file_match[1] if file_match

      Jekyll.logger.warn "VPM Listing:", "    Could not extract version from #{url}, using default"
      '1.0.0'
    end

    def generate_display_name(package_name)
      package_name
        .gsub(/^org\.vrton\./, '')
        .gsub(/([a-z])([A-Z])/, '\1 \2')
        .gsub(/[._-]/, ' ')
        .upcase
    end

    def get_default_dependencies
      {
        'com.poiyomi.toon' => '^9.2.67',
        'com.vrcfury.vrcfury' => '^1.1241.0'
      }
    end

    def calculate_sha256_placeholder(url)
      # Generate a consistent placeholder hash based on URL
      # In a production environment, you might want to actually fetch and hash the file
      Digest::SHA256.hexdigest(url + Time.now.to_i.to_s)
    end
  end
end