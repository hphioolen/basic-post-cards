/**
 * External dependencies
 */
import { isUndefined, pickBy } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component, RawHTML, Fragment } from '@wordpress/element';
import {
	PanelBody,
	Placeholder,
	QueryControls,
	RangeControl,
	Spinner,
	ToggleControl,
	Toolbar,
	RadioControl,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { dateI18n, format, __experimentalGetSettings } from '@wordpress/date';
import {
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import { withSelect } from '@wordpress/data';

/**
 * Module Constants
 */
const CATEGORIES_LIST_QUERY = {
	per_page: -1,
};
const MAX_POSTS_COLUMNS = 6;

class LatestPostsEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			categoriesList: [],
		};
	}
	// weet nog niet wat dit doet??
	componentDidMount() {
		this.isStillMounted = true;
		this.fetchRequest = apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', CATEGORIES_LIST_QUERY ),
		} ).then(
			( categoriesList ) => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList } );
				}
			}
		).catch(
			() => {
				if ( this.isStillMounted ) {
					this.setState( { categoriesList: [] } );
				}
			}
		);
	}

	componentWillUnmount() {
		this.isStillMounted = false;
	}

	render() {
		const { attributes, setAttributes, latestPosts } = this.props;
		const { categoriesList } = this.state;
		const { displayPostContent, displayPostDate, postLayout, columns, order, orderBy, categories, postsToShow, excerptLength } = attributes;

		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Post Content Settings' ) }>
					<ToggleControl
						label={ __( 'Post Content' ) }
						checked={ displayPostContent }
						onChange={ ( value ) => setAttributes( { displayPostContent: value } ) }
					/>
					{ displayPostContent &&
						<RangeControl
							label={ __( 'Max number of words in excerpt' ) }
							value={ excerptLength }
							onChange={ ( value ) => setAttributes( { excerptLength: value } ) }
							min={ 10 }
							max={ 100 }
						/>
					}
				</PanelBody>

				<PanelBody title={ __( 'Post Meta Settings' ) }>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ ( value ) => setAttributes( { displayPostDate: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Sorting and Filtering' ) }>
					<QueryControls
						{ ...{ order, orderBy } }
						numberOfItems={ postsToShow }
						categoriesList={ categoriesList }
						selectedCategoryId={ categories }
						onOrderChange={ ( value ) => setAttributes( { order: value } ) }
						onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
						onCategoryChange={ ( value ) => setAttributes( { categories: '' !== value ? value : undefined } ) }
						onNumberOfItemsChange={ ( value ) => setAttributes( { postsToShow: value } ) }
					/>
					<RangeControl
						label={ __( 'Columns' ) }
						value={ columns }
						onChange={ ( value ) => setAttributes( { columns: value } ) }
						min={ 2 }
						max={ ! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, latestPosts.length ) }
						required
					/>
				</PanelBody>
			</InspectorControls>
		);

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		if ( ! hasPosts ) {
			return (
				<Fragment>
					{ inspectorControls }
					<Placeholder
						icon="admin-post"
						label={ __( 'Latest Posts' ) }
					>
						{ ! Array.isArray( latestPosts ) ?
							<Spinner /> :
							__( 'No posts found.' )
						}
					</Placeholder>
				</Fragment>
			);
		}

		const displayPosts = latestPosts.length > postsToShow ?
			latestPosts.slice( 0, postsToShow ) :
			latestPosts;

		const dateFormat = __experimentalGetSettings().formats.date;

		return (
			<Fragment>
				{ inspectorControls }
				<section
					className={ classnames( this.props.className, {
						cards: true,
						'has-dates': displayPostDate,
						[ `columns-${ columns }` ]: postLayout === 'grid',
					} ) }
				>
					{ displayPosts.map( ( post, i ) => {
						const titleTrimmed = post.title.rendered.trim();
						let excerpt = post.excerpt.rendered;
						if ( post.excerpt.raw === '' ) {
							excerpt = post.content.raw;
						}
						const featImg = imageURL => {
							return imageURL ? imageURL : 'https://abbeyjfitzgerald.com/wp-content/uploads/2018/01/cloud.svg';
						};
						// eslint-disable-next-line no-console
						console.info( post );
						const excerptElement = document.createElement( 'div' );
						excerptElement.innerHTML = excerpt;
						excerpt = excerptElement.textContent || excerptElement.innerText || '';
						return (
							<article className="card" key={ i }>
								<a href={ post.link } target="_blank" rel="noreferrer noopener">
									<picture className="thumbnail">
										<img src={ featImg( post.featured_image_post_url ) } alt="logo" />
									</picture>
									<div className="card-content">
										<h3 className="card-content__post-title">
											{ titleTrimmed ? (
												<RawHTML>
													{ titleTrimmed }
												</RawHTML>
											) :
												__( '(no title)' )
											}
										</h3>
										{ displayPostDate && post.date_gmt &&
										<time dateTime={ format( 'c', post.date_gmt ) } className="card-content__post-date">
											{ dateI18n( dateFormat, post.date_gmt ) }
										</time>
										}
										{ displayPostContent &&
										<div className="card-content__post-excerpt">
											<RawHTML
												key="html"
                    	>
												{ excerptLength < excerpt.trim().split( ' ' ).length ?
                    			excerpt.trim().split( ' ', excerptLength ).join( ' ' ) + ' ... <a href=' + post.link + 'target="_blank" rel="noopener noreferrer">' + __( 'Read more' ) + '</a>' :
                    			excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
											</RawHTML>
										</div>
										}
									</div>
								</a>
							</article>
						);
					} ) }
				</section>
			</Fragment>
		);
	}
}

export default withSelect( ( select, props ) => {
	const { postsToShow, order, orderBy, categories } = props.attributes;
	const { getEntityRecords } = select( 'core' );
	const latestPostsQuery = pickBy( {
		categories,
		order,
		orderby: orderBy,
		per_page: postsToShow,
	}, ( value ) => ! isUndefined( value ) );
	return {
		latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
	};
} )( LatestPostsEdit );
